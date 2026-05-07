"use client";

import {
  publishCollection,
  archiveCollection,
  unarchiveCollection,
} from "@/lib/actions/collections";
import { StatusActions } from "@/components/domain/catalog/status-actions";

export function CollectionStatusActions({
  collectionId,
  currentStatus,
}: {
  collectionId: string;
  currentStatus: string;
}) {
  return (
    <StatusActions
      currentStatus={currentStatus}
      entityLabel="Coleção"
      onPublish={() => publishCollection(collectionId)}
      onArchive={() => archiveCollection(collectionId)}
      onUnarchive={() => unarchiveCollection(collectionId)}
    />
  );
}
