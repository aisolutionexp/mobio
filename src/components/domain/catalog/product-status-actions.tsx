"use client";

import {
  publishProduct,
  archiveProduct,
  unarchiveProduct,
} from "@/lib/actions/products";
import { StatusActions } from "@/components/domain/catalog/status-actions";

export function ProductStatusActions({
  productId,
  collectionId,
  currentStatus,
}: {
  productId: string;
  collectionId: string;
  currentStatus: string;
}) {
  return (
    <StatusActions
      currentStatus={currentStatus}
      entityLabel="Produto"
      onPublish={() => publishProduct(productId, collectionId)}
      onArchive={() => archiveProduct(productId, collectionId)}
      onUnarchive={() => unarchiveProduct(productId, collectionId)}
    />
  );
}
