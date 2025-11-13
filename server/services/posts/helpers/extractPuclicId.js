function extractPublicId(url, folder) {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return `${folder}/${filename.split(".")[0]}`;
}

export default extractPublicId