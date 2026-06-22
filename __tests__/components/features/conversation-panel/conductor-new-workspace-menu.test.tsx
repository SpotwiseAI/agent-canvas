import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "test-utils";
import { ConductorNewWorkspaceMenu } from "#/components/features/conversation-panel/conductor-new-workspace-menu";

describe("ConductorNewWorkspaceMenu", () => {
  it("opens a three-item menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConductorNewWorkspaceMenu />);

    await user.click(screen.getByTestId("conductor-new-workspace-button"));

    expect(
      screen.getByTestId("conductor-new-workspace-open-project"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conductor-new-workspace-open-github-project"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conductor-new-workspace-quick-start"),
    ).toBeInTheDocument();
  });

  it("opens the GitHub repository picker only (no local-folder section)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConductorNewWorkspaceMenu />);

    await user.click(screen.getByTestId("conductor-new-workspace-button"));
    await user.click(
      screen.getByTestId("conductor-new-workspace-open-github-project"),
    );

    expect(
      screen.getByTestId("open-workspace-dialog-body"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("local-repository-form")).toBeInTheDocument();
  });
});
