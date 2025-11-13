const PostMedia = ({ media }) => {
  if (!media || media.length === 0) return null;
  return (
    <div
      className={`grid gap-2 mb-3 ${
        media.length === 1
          ? "grid-cols-1"
          : media.length === 2
          ? "grid-cols-2"
          : media.length === 3
          ? "grid-cols-3"
          : "grid-cols-2"
      }`}
    >
      {media.map((item, index) => (
        <div
          key={index}
          className={`rounded-2xl overflow-hidden bg-gray-100 ${
            media.length === 1
              ? "max-h-[600px]"
              : media.length === 3 && index === 0
              ? "col-span-3 max-h-[400px]"
              : "aspect-square"
          }`}
        >
          {item.type === "video" ? (
            <video
              src={item.media_url}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <img
              src={item.media_url}
              alt={`Post media ${index + 1}`}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PostMedia;
