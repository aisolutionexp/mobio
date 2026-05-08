import { render } from "@testing-library/react";
import { axe } from "@/lib/test/a11y";
import { SkipLink } from "@/components/shared/skip-link";

describe("SkipLink a11y", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(<SkipLink />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should render link targeting #main-content", () => {
    const { getByText } = render(<SkipLink />);
    const link = getByText("Pular para conteúdo principal");
    expect(link.getAttribute("href")).toBe("#main-content");
  });
});
