import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFormSubmissionConfirmation } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form || !form.active) {
      return NextResponse.json(
        { error: "Form not found or inactive" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    // Validate form fields if needed
    let fields: Array<{ name: string; type: string; required: boolean }> = [];
    try {
      fields = JSON.parse(form.fields);
    } catch {
      // If fields can't be parsed, skip validation
    }

    // Check required fields
    for (const field of fields) {
      if (field.required && !data[field.name]) {
        return NextResponse.json(
          { error: `Field "${field.name}" is required` },
          { status: 400 }
        );
      }
    }

    // Store the response
    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        data: JSON.stringify(data),
      },
      include: { form: { include: { tenant: true } } },
    });

    // Send confirmation email if email field exists
    const emailField = fields.find((f) => f.type === "email");
    if (emailField && data[emailField.name]) {
      await sendFormSubmissionConfirmation(
        data[emailField.name],
        form.name,
        response.form.tenant.name
      );
    }

    return NextResponse.json({
      id: response.id,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
