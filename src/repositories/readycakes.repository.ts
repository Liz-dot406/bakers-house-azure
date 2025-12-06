import { getPool } from "../db/config";
import { Cake } from "../types/readycakes.types";

export const getAllCakes = async () => {
  const pool = await getPool();
  const result = await pool
    .request()
    .query("SELECT * FROM ReadyMade_Cakes WHERE isactive = 1");
  return result.recordset;
};

export const getCakeById = async (id: number) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", id)
    .query("SELECT * FROM ReadyMade_Cakes WHERE cakeId = @id AND isactive = 1");
  return result.recordset[0];
};

export const createCake = async (cake: Cake) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("cakeName", cake.cakeName)
    .input("flavorsUsed", cake.flavorsUsed)
    .input("size", cake.size)
    .input("imageURL", cake.imageURL)
    .input("quantityAvailable", cake.quantityAvailable ?? 1).query(`
      INSERT INTO ReadyMade_Cakes (cakeName, flavorsUsed, size, imageURL, quantityAvailable)
      VALUES (@cakeName, @flavorsUsed, @size, @imageURL, @quantityAvailable);
      SELECT SCOPE_IDENTITY() AS cakeId;
    `);
  return result.recordset[0];
};

export const updateCake = async (id: number, cake: Partial<Cake>) => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .input("cakeName", cake.cakeName)
    .input("flavorsUsed", cake.flavorsUsed)
    .input("size", cake.size)
    .input("imageURL", cake.imageURL)
    .input("quantityAvailable", cake.quantityAvailable).query(`
      UPDATE ReadyMade_Cakes
      SET 
        cakeName = COALESCE(@cakeName, cakeName),
        flavorsUsed = COALESCE(@flavorsUsed, flavorsUsed),
        size = COALESCE(@size, size),
        imageURL = COALESCE(@imageURL, imageURL),
        quantityAvailable = COALESCE(@quantityAvailable, quantityAvailable),
        updatedAt = SYSDATETIME()
      WHERE cakeId = @id;
    `);
};

export const deleteCake = async (id: number) => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .query("UPDATE ReadyMade_Cakes SET isactive = 0 WHERE cakeId = @id");
};
