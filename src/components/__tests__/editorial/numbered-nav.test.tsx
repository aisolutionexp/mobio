import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LayoutDashboard, Settings } from "lucide-react";

import { NumberedNav, type NavItem } from "@/components/editorial/numbered-nav";

const items: NavItem[] = [
  {
    number: "01",
    label: "Salão",
    href: "/atelier/salao",
    icon: LayoutDashboard,
  },
  { number: "02", label: "Coleções", href: "/atelier/catalogo" },
  {
    number: "03",
    label: "Configurações",
    href: "/atelier/config",
    icon: Settings,
    badge: 3,
  },
];

describe("NumberedNav", () => {
  it("renders all navigation items", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    expect(screen.getByText("Salão")).toBeInTheDocument();
    expect(screen.getByText("Coleções")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });

  it("renders item numbers", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("sets aria-current=page on active item", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    const activeLink = screen.getByText("Salão").closest("a");
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current on inactive items", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    const inactiveLink = screen.getByText("Coleções").closest("a");
    expect(inactiveLink).not.toHaveAttribute("aria-current");
  });

  it("renders badge when provided", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders header when provided", () => {
    render(
      <NumberedNav
        items={items}
        activeHref="/atelier/salao"
        header={<span>Header Content</span>}
      />,
    );
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    render(
      <NumberedNav
        items={items}
        activeHref="/atelier/salao"
        footer={<span>Footer Content</span>}
      />,
    );
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("generates correct links", () => {
    render(<NumberedNav items={items} activeHref="/atelier/salao" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/atelier/salao");
    expect(links[1]).toHaveAttribute("href", "/atelier/catalogo");
    expect(links[2]).toHaveAttribute("href", "/atelier/config");
  });
});
