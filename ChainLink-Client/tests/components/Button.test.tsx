import React from "react";
import { describe, test, expect } from "vitest";
import { renderWithProviders } from "../../src/test-utils";
import { FETCH_USER_BY_NAME } from "../../src/graphql/queries/userQueries";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Button from "../../src/components/Button";
import "@testing-library/jest-dom";

describe("Button Component", () => {
  test("renders with correct text and default styles", () => {
    render(<Button type="primary">Click Me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Click Me");
    expect(button).toHaveClass("button-primary");
  });

  test("applies correct custom width", () => {
    render(
      <Button type="primary" width={200}>
        Click Me
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("width: 200%");
  });

  test("applies correct marginTop", () => {
    render(
      <Button type="primary" marginTop={10}>
        Click Me
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("margin-top: 10px");
  });

  test("button is disabled when the disabled prop is true", () => {
    render(
      <Button type="primary" disabled={true}>
        Click Me
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("button triggers onClick function when clicked", () => {
    const mockOnClick = vi.fn();
    render(
      <Button type="primary" onClick={mockOnClick}>
        Click Me
      </Button>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("renders correct class for warning type", () => {
    render(<Button type="warning">Warning</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("button-warning");
  });

  test("renders correct class for secondary type", () => {
    render(<Button type="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("button-secondary");
  });

  test("renders correct class for transparent type", () => {
    render(<Button type="transparent">Transparent</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("button-transparent");
  });

  test("button renders with custom color", () => {
    render(
      <Button type="primary" color="red">
        Click Me
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background-color: red");
  });
});
