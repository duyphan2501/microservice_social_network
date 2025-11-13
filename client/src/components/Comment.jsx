import { Heart } from "lucide-react";
import { useState } from "react";
import useUserStore from "../stores/useUserStore";
import { formatRelativeTime } from "../utils/DateFormat";

// Component nhập phản hồi tái sử dụng
const ReplyInput = ({ username, className = "" }) => (
  <div className={`flex gap-2 ${className}`}>
    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
    <input
      type="text"
      placeholder={`Trả lời ${username}...`}
      className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button className="text-gray-400">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
);

// Component hiển thị 1 comment (và replies của nó)
const Comment = ({ comment, level = 0, onReply, showReplyInput }) => {
  const usersCache = useUserStore((state) => state.usersCache);
  const commentUser = usersCache[comment.user_id];
  const hasReplies = comment.replies && comment.replies.length > 0;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes_count);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleReplies = () => setShowReplies((prev) => !prev);
  const handleReplyClick = () => onReply(comment.id);

  return (
    <div className="relative flex gap-3">
      {/* --- Lines for nested comments --- */}
      {level > 0 && (
        <>
          <div className="absolute left-5 top-0 w-0.5 bg-gray-200 h-full transition-all duration-200" />
          <div className="absolute left-5 top-5 w-6 h-0.5 bg-gray-200 transition-all duration-200" />
        </>
      )}

      {/* --- Avatar --- */}
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

      {/* --- Content --- */}
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
            onClick={handleLike}
            className="flex items-center gap-1 group"
          >
            <Heart
              className={`w-3.5 h-3.5 transition ${
                liked ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs font-semibold transition ${
                liked
                  ? "text-red-500"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            >
              Thích
            </span>
          </button>

          {likeCount > 0 && (
            <span className="text-gray-500 text-xs">{likeCount}</span>
          )}

          <button
            onClick={handleReplyClick}
            className="text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
          >
            Trả lời
          </button>
        </div>

        {/* --- Xem / Ẩn phản hồi --- */}
        {level === 0 && hasReplies && (
          <button
            onClick={toggleReplies}
            className="text-gray-600 text-sm font-semibold mt-3 ml-3 hover:text-gray-800 transition"
          >
            {showReplies
              ? "— Ẩn phản hồi"
              : `— Xem ${comment.replies.length} phản hồi`}
          </button>
        )}

        {/* --- Reply input --- */}
        {showReplyInput === comment.id && (
          <ReplyInput
            username={commentUser?.username || "người này"}
            className={`mt-3 ml-${level > 0 ? 3 : 11}`}
          />
        )}

        {/* --- Hiển thị replies --- */}
        {showReplies && hasReplies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                showReplyInput={showReplyInput}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
