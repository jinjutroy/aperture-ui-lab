// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./system";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Aperture UI Lab", () => {
  it("persists controls and supports keyboard tab navigation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Emerald accent" }));
    expect(
      screen.getByRole("button", { name: "Emerald accent" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").accent,
    ).toBe("emerald");

    const canvasTabs = within(screen.getByRole("tablist", { name: "Canvas view" }));
    canvasTabs.getByRole("tab", { name: "Workspace" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(canvasTabs.getByRole("tab", { name: "Components" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(canvasTabs.getByRole("tab", { name: "Components" })).toHaveFocus();
    const toggle = screen.getByRole("switch", { name: "Email notifications" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");

    canvasTabs.getByRole("tab", { name: "Components" }).focus();
    await user.keyboard("{End}");
    expect(canvasTabs.getByRole("tab", { name: "Tokens" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("creates a sample project and filters the project list", async () => {
    const user = userEvent.setup();
    render(<App />);
    const opener = screen.getByRole("button", { name: "New project" });
    await user.click(opener);
    expect(
      screen.getByRole("dialog", { name: "Create a project" }),
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "Project name" }),
      "Horizon dashboard",
    );
    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(screen.getByText("Horizon dashboard")).toBeInTheDocument();
    expect(opener).toHaveFocus();

    await user.type(
      screen.getByRole("textbox", { name: "Search projects" }),
      "not found",
    );
    expect(screen.getByText("No matching projects")).toBeInTheDocument();
  });

  it("explains the email demo and validates the invite field", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Components" }));
    const components = screen.getByRole("tabpanel", { name: "Components" });
    expect(
      within(components).getByText("Demo only — no email is sent."),
    ).toBeInTheDocument();
    await user.type(
      within(components).getByRole("textbox", { name: "Invite a teammate" }),
      "invalid",
    );
    await user.click(
      within(components).getByRole("button", { name: "Invite" }),
    );
    expect(
      within(components).getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });
});
