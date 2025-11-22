import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HostPage from "../pages/HostPage";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Default mock for useAuth; overridden per test
const mockUseAuth = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const renderHostPage = () =>
  render(
    <MemoryRouter>
      <HostPage />
    </MemoryRouter>
  );

describe("HostPage auth and dashboard flows", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReset();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it("redirects unauthenticated users to login when submitting a listing", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });

    renderHostPage();

    // Submit without filling fields to trigger auth guard branch
    fireEvent.submit(screen.getByRole("button", { name: /publish listing/i }).closest("form")!);

    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: { from: "/host" } });
    expect(await screen.findByText(/please log in to publish a listing/i)).toBeInTheDocument();
  });

  it("shows host listings for the authenticated owner", async () => {
    const hostUser = { id: "host-1", email: "host@example.com" };
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: hostUser });

    // Mock listings (only one belongs to the host)
    (global.fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "a", title: "Host Villa", description: "My place", price: 400, latitude: 34.05, longitude: -118.25, owner_id: "host-1" },
        { id: "b", title: "Not Mine", description: "Other", price: 300, latitude: 10, longitude: 20, owner_id: "other-user" },
      ],
    });

    renderHostPage();

    await waitFor(() => expect(screen.getByText("Host Villa")).toBeInTheDocument());
    expect(screen.getByText(/your listings/i)).toBeInTheDocument();
    expect(screen.queryByText("Not Mine")).not.toBeInTheDocument();
  });
});
