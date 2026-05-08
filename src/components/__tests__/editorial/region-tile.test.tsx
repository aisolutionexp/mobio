import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { RegionTile } from "@/components/editorial/region-tile";

describe("RegionTile", () => {
  const region = { id: "r1", name: "Sul", code: "SUL" };

  it("renders region name and factory count", () => {
    render(<RegionTile region={region} factoryCount={5} />);
    expect(screen.getByText("Sul")).toBeInTheDocument();
    expect(screen.getByText("5 atelies")).toBeInTheDocument();
  });

  it("uses singular form for single factory", () => {
    render(<RegionTile region={region} factoryCount={1} />);
    expect(screen.getByText("1 atelie")).toBeInTheDocument();
  });

  it("links to discover page with region filter", () => {
    render(<RegionTile region={region} factoryCount={3} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/lojista/praca?region=r1");
  });

  it("uses custom href when provided", () => {
    render(<RegionTile region={region} factoryCount={3} href="/custom/path" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/custom/path");
  });
});
