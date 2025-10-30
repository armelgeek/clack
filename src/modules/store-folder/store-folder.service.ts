import { Injectable } from "@nestjs/common";
import { StoreFolderRepository } from "./store-folder.repository";

@Injectable()
export class StoreFolderService {
  constructor(private repository: StoreFolderRepository) {}

  createFolder(name: string, storeId?: string, parentId?: string) {
    return this.repository.createFolder(name, storeId, parentId);
  }

  getAllFolders() {
    return this.repository.getAllFolders();
  }
}
