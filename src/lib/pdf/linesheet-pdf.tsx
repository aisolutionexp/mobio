import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.ttf",
      fontWeight: 700,
    },
  ],
});

const PRICING_VARIANT_LABELS: Record<string, string> = {
  retailer: "Atacado",
  msrp: "Varejo sugerido",
  custom: "Personalizado",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    color: "#1a1a1a",
  },
  coverPage: {
    fontFamily: "Inter",
    padding: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  coverBrand: {
    fontSize: 12,
    letterSpacing: 4,
    color: "#999",
    marginBottom: 24,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 12,
    textAlign: "center",
    color: "#111",
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  coverMeta: {
    fontSize: 11,
    color: "#999",
    marginTop: 32,
    textAlign: "center",
  },
  coverBadge: {
    fontSize: 9,
    color: "#fff",
    backgroundColor: "#333",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  itemCard: {
    width: "47%",
    marginBottom: 20,
    border: "1 solid #e5e5e5",
    borderRadius: 6,
    padding: 10,
  },
  itemImage: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  itemFactory: {
    fontSize: 9,
    color: "#888",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333",
  },
  itemNote: {
    fontSize: 8,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  itemRef: {
    fontSize: 8,
    color: "#aaa",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#bbb",
  },
});

interface PdfItem {
  productName: string;
  reference: string | null;
  factoryName: string | null;
  price: number | null;
  note: string | null;
  imageUrl: string | null;
}

interface LinesheetPdfProps {
  linesheetName: string;
  retailerName: string;
  pricingVariant: string;
  createdAt: string;
  items: PdfItem[];
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function LinesheetDocument({
  linesheetName,
  retailerName,
  pricingVariant,
  createdAt,
  items,
}: LinesheetPdfProps) {
  const pages: PdfItem[][] = [];
  for (let i = 0; i < items.length; i += 4) {
    pages.push(items.slice(i, i + 4));
  }

  const totalPages = pages.length + 1;
  const dateStr = formatDate(createdAt);
  const variantLabel = PRICING_VARIANT_LABELS[pricingVariant] ?? pricingVariant;

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverBrand}>MOBIO</Text>
        <Text style={styles.coverTitle}>{linesheetName}</Text>
        {retailerName && (
          <Text style={styles.coverSubtitle}>{retailerName}</Text>
        )}
        <Text style={styles.coverMeta}>
          {items.length} {items.length === 1 ? "produto" : "produtos"} •{" "}
          {dateStr}
        </Text>
        <Text style={styles.coverBadge}>{variantLabel}</Text>
        <Text style={styles.footer as never}>Página 1 de {totalPages}</Text>
      </Page>

      {pages.map((pageItems, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.grid}>
            {pageItems.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.itemCard}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={{ fontSize: 9, color: "#ccc" }}>
                      Sem imagem
                    </Text>
                  </View>
                )}
                <Text style={styles.itemName}>{item.productName}</Text>
                {item.reference && (
                  <Text style={styles.itemRef}>Ref: {item.reference}</Text>
                )}
                {item.factoryName && (
                  <Text style={styles.itemFactory}>{item.factoryName}</Text>
                )}
                {item.price != null && (
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                )}
                {item.note && <Text style={styles.itemNote}>{item.note}</Text>}
              </View>
            ))}
          </View>
          <View style={styles.footer} fixed>
            <Text>
              Gerado em {dateStr} • {variantLabel}
            </Text>
            <Text>
              Página {pageIdx + 2} de {totalPages}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export async function renderLinesheetPdf(
  props: LinesheetPdfProps,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<LinesheetDocument {...props} />);
  return Buffer.from(buffer);
}
