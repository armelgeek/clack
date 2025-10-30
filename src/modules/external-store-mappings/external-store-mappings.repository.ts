import { Injectable } from "@nestjs/common";
import { db } from "@/database";
import { externalStoreMappings , NewExternalStoreMappings , ExternalStoreMappings } from "@/database";
import { eq } from "drizzle-orm";
@Injectable()
export class ExternalStoreMappingRepository {

  async findByExternalCompanyId(companyId: number): Promise<ExternalStoreMappings | undefined> {
    // Use direct column reference to avoid incompatible ORMs/types in the callback signature
    const mapping = await db.query.externalStoreMappings.findFirst({
      where: eq(externalStoreMappings.externalCompanyId, companyId),
      with: {
        store: true,
      },
    });

    return mapping;
  }

  async findAll(){ 
    return await db.query.externalStoreMappings.findMany({
      with: {
        store: true, 
      }
    })
  }

  async create(data: NewExternalStoreMappings): Promise<ExternalStoreMappings[]> {
    const result = await db.insert(externalStoreMappings).values(data).returning();
    return result;
  }

}
