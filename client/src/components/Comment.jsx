import { useState } from "react";
import useUserStore from "../stores/useUserStore";
import { formatRelativeTime } from "../utils/DateFormat";

// Component nhập phản hồi tái sử dụng
const ReplyInput = ({ username, className = "", onSubmit }) => {
  const user = useUserStore((state) => state.user);
  const [content, setContent] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(content);
    setContent("");
  };

  if (!user) {
    return null;
  }

  return (
    <form className={`flex gap-2 ${className}`} onSubmit={handleSubmit}>
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
        <img src={user.avatar_url} alt="" />
      </div>

      <input
        type="text"
        value={content}
        disabled={!user}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Reply ${username}...`}
        className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="text-gray-400 hover:text-black" type="submit">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
};

// Component hiển thị 1 comment (và replies của nó)
const Comment = ({ comment, level = 0, onReply, showReplyInput, onSubmit }) => {
  const usersCache = useUserStore((state) => state.usersCache);
  const user = useUserStore((state) => state.user);
  const commentUser = usersCache[comment.user_id] || user;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const [showReplies, setShowReplies] = useState(false);

  const toggleReplies = () => setShowReplies((prev) => !prev);
  const handleReplyClick = () => onReply(comment.id);

  // Determine if this specific comment instance should show the reply input
  const isShowingReplyInput = showReplyInput === comment.id;

  return (
    <div className="relative flex gap-3">
      {/* --- Lines for nested comments --- */}
      {level > 0 && (
        <>
          {/* Note: the absolute positioning logic might need fine-tuning with your specific Tailwind config */}
          <div className="absolute left-5 top-0 w-0.5 bg-gray-200 h-full transition-all duration-200" />
          <div className="absolute left-5 top-5 w-6 h-0.5 bg-gray-200 transition-all duration-200" />
        </>
      )}

      {/* --- Avatar --- */}
      {/* Avatar size remains consistent, positioning handled by flex gap and nesting lines */}
      <div className={`relative z-10 ${level > 0 ? "ml-11" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 overflow-hidden">
          {commentUser?.avatar_url ? (
            <img
              src={commentUser.avatar_url}
              alt={commentUser.username}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex-grow min-w-0">
        <div className="bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full">
          <div className="font-semibold text-[15px] mb-0.5">
            {commentUser?.username || "Ẩn danh"}
          </div>
          <p className="text-[15px] whitespace-pre-line break-words">
            {comment.content}
          </p>
        </div>

        {/* --- Action buttons --- */}
        <div className="flex items-center gap-4 mt-1.5 ml-3">
          <span className="text-gray-500 text-xs">
            {formatRelativeTime(comment.created_at)}
          </span>

          <button
            onClick={handleReplyClick}
            className="text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
          >
            Reply
          </button>
        </div>

        {/* --- Toggle Replies Button --- */}
        {/* We allow toggling replies for any comment that *has* replies now */}
        {hasReplies && (
          <button
            onClick={toggleReplies}
            className="text-gray-600 text-sm font-semibold mt-3 ml-3 hover:text-gray-800 transition"
          >
            {showReplies
              ? "— Hide replies"
              : `— View ${comment.replies.length} repl${comment.replies.length > 1 ? "ies" : "y"}`}
          </button>
        )}

        {/* --- Reply input for *this* comment instance --- */}
        {isShowingReplyInput && (
          // The ReplyInput should align with the text block above it.
          // We can remove the complex ml-* class calculation since it's already inside the correct flex-grow container.
          <ReplyInput
            username={commentUser?.username || "người này"}
            className="mt-3" // Simple margin top is enough here
            onSubmit={onSubmit}
          />
        )}

        {/* --- Display replies --- */}
        {showReplies && hasReplies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                showReplyInput={showReplyInput} // Passed down to check against *child* IDs
                onSubmit={onSubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
