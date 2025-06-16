export function getStoreId(): string | null {
  const storeId = localStorage.getItem("storeId");

  if (!storeId) {
    alert("ID da loja não encontrado no localStorage");
    return null;
  }

  return storeId;
}