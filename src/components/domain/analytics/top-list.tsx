import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";
import { formatBRL } from "@/lib/utils";

interface TopListItem {
  name: string;
  quantity: number;
  gmv_cents: number;
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  maxItems?: number;
  valueLabel?: "gmv" | "quantity";
}

export function TopList({
  title,
  items,
  maxItems = 5,
  valueLabel = "gmv",
}: TopListProps) {
  const visible = items.slice(0, maxItems);

  return (
    <Plate padded>
      <Eyebrow as="p" className="mb-4">
        {title}
      </Eyebrow>

      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum dado no período selecionado.
        </p>
      ) : (
        <div className="space-y-0">
          {visible.map((item, i) => (
            <div key={item.name}>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 text-right text-xs">
                    {i + 1}.
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {valueLabel === "gmv"
                    ? formatBRL(item.gmv_cents / 100)
                    : `${item.quantity} un.`}
                </span>
              </div>
              {i < visible.length - 1 && <Rule spacing="sm" variant="dotted" />}
            </div>
          ))}
        </div>
      )}
    </Plate>
  );
}
