import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

describe("shared UI primitives", () => {
  it("provides button variants, sizes, and loading and disabled states", () => {
    render(
      <>
        <Button variant="secondary" size="lg">
          Continue
        </Button>
        <Button loading loadingLabel="Saving">
          Save changes
        </Button>
        <Button disabled>Unavailable</Button>
      </>,
    );

    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass(
      "bg-leaf-800",
      "min-h-13",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  });

  it("associates visible labels, descriptions, required state, and validation errors", () => {
    render(
      <FormField
        error="Enter a valid email address."
        hint="We will only use this for account updates."
        id="email-address"
        label="Email address"
        required
      >
        {(props) => <Input {...props} type="email" />}
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Email address" });

    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "We will only use this for account updates. Enter a valid email address.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );
  });

  it("retains native accessible controls for text, choice, and selection", () => {
    render(
      <>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" />
        <label htmlFor="updates">Receive updates</label>
        <Checkbox id="updates" />
        <fieldset>
          <legend>Preferred contact</legend>
          <label htmlFor="contact-email">Email</label>
          <Radio id="contact-email" name="contact" value="email" />
          <label htmlFor="contact-phone">Phone</label>
          <Radio id="contact-phone" name="contact" value="phone" />
        </fieldset>
        <label htmlFor="area">Area</label>
        <Select id="area" defaultValue="">
          <option value="">Choose an area</option>
          <option value="north">North</option>
        </Select>
      </>,
    );

    const updates = screen.getByRole("checkbox", { name: "Receive updates" });
    fireEvent.click(updates);
    expect(updates).toBeChecked();

    const phone = screen.getByRole("radio", { name: "Phone" });
    fireEvent.click(phone);
    expect(phone).toBeChecked();
    expect(screen.getByRole("radio", { name: "Email" })).not.toBeChecked();
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Area" })).toBeInTheDocument();
  });

  it("exposes status labels and status-appropriate live regions", () => {
    render(
      <>
        <Badge variant="success">Ready</Badge>
        <Feedback variant="success">Your changes were saved.</Feedback>
        <Feedback variant="danger">Check the highlighted fields.</Feedback>
        <Spinner label="Loading restaurants" />
      </>,
    );

    expect(screen.getByText("Ready")).toHaveClass("text-success-ink");
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Error");
    expect(
      screen.getByRole("status", { name: "Loading restaurants" }),
    ).toBeInTheDocument();
  });

  it("provides titled card, empty, and skeleton structures", () => {
    render(
      <>
        <Card>
          <CardContent>
            <CardTitle>Workspace overview</CardTitle>
          </CardContent>
        </Card>
        <EmptyState
          description="This area will appear when it is ready."
          title="Nothing here yet"
        />
        <EmptyState
          description="No results have been added."
          title="No results"
        />
        <Skeleton data-testid="skeleton" className="h-6 w-32" />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "Workspace overview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nothing here yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No results" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(2);
    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
