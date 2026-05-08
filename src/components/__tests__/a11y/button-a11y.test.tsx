import { render } from "@testing-library/react";
import { axe } from "@/lib/test/a11y";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

describe("Button a11y", () => {
  it("text button should have no a11y violations", async () => {
    const { container } = render(<Button>Salvar</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("icon-only button with aria-label should have no a11y violations", async () => {
    const { container } = render(
      <Button size="icon" aria-label="Buscar">
        <Search className="size-4" />
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("loading button should have no a11y violations", async () => {
    const { container } = render(<Button loading>Salvando</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
