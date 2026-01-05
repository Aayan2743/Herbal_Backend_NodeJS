export const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

export const getImageUrl = (req, folder, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};