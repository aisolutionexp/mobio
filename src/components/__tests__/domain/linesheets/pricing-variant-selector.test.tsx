import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PricingVariantSelector } from "@/components/domain/linesheets/pricing-variant-selector";

describe("PricingVariantSelector", () => {
  it("renders all three variants", () => {
    render(<PricingVariantSelector name="pricing_variant" />);
    expect(screen.getByText("Preço atacado")).toBeInTheDocument();
    expect(screen.getByText("Preço sugerido")).toBeInTheDocument();
    expect(screen.getByText("Preço customizado")).toBeInTheDocument();
  });

  it("defaults to retailer", () => {
    render(<PricingVariantSelector name="pricing_variant" />);
    const radios = screen.getAllByRole("radio");
    const retailerRadio = radios.find(
      (r) => (r as HTMLInputElement).value === "retailer",
    );
    expect(retailerRadio).toBeChecked();
  });

  it("respects defaultValue prop", () => {
    render(
      <PricingVariantSelector name="pricing_variant" defaultValue="msrp" />,
    );
    const radios = screen.getAllByRole("radio");
    const msrpRadio = radios.find(
      (r) => (r as HTMLInputElement).value === "msrp",
    );
    expect(msrpRadio).toBeChecked();
  });

  it("calls onChange when selecting a variant", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PricingVariantSelector name="pricing_variant" onChange={onChange} />,
    );

    await user.click(screen.getByText("Preço customizado"));
    expect(onChange).toHaveBeenCalledWith("custom");
  });

  it("updates hidden input value on change", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PricingVariantSelector name="pricing_variant" />,
    );

    await user.click(screen.getByText("Preço sugerido"));

    const hiddenInput = container.querySelector(
      'input[type="hidden"][name="pricing_variant"]',
    ) as HTMLInputElement;
    expect(hiddenInput.value).toBe("msrp");
  });
});
