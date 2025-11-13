import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../utils/DateFormat";
import useUserStore from "../stores/useUserStore";
import PostMedia from "./PostMedia";

const ThreadPost = ({ post }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const navigate = useNavigate();
  const usersCache = useUserStore((state) => state.usersCache);
  const author = usersCache[post.user_id];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="px-4 py-4 hover:bg-gray-50 transition border-b border-gray-200">
      <div className="flex gap-3">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 overflow-hidden">
            <img
              src={author.avatar_url}
              alt=""
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="font-semibold text-[15px]">
                {author?.username || "username"}
              </span>
              <span className="text-gray-500 text-xs">
                &bull; {formatRelativeTime(post.created_at)}
              </span>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>

          <p className="text-[15px] mb-3 whitespace-pre-line">{post.content}</p>

          {/* Media Display */}
          <div className="">
            <PostMedia media={post.media} />
          </div>

          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 hover:opacity-70 transition group"
            >
              <svg
                className={`w-5 h-5 ${
                  liked ? "fill-red-500 text-red-500" : "text-gray-700"
                } group-hover:scale-110 transition-transform`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && (
                <span className="text-gray-600 text-sm">{likeCount}</span>
              )}
            </button>

            <button
              onClick={() => navigate(`/post/${post.id}/comments`)}
              className="flex items-center gap-2 hover:opacity-70 transition group"
            >
              <svg
                className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {post.comments_count > 0 && (
                <span className="text-gray-600 text-sm">
                  {post.comments_count}
                </span>
              )}
            </button>

            <button className="flex items-center gap-2 hover:opacity-70 transition group">
              <svg
                className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {post.reposts > 0 && (
                <span className="text-gray-600 text-sm">{post.reposts}</span>
              )}
            </button>

            <button className="flex items-center gap-2 hover:opacity-70 transition group">
              <svg
                className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {post.shares > 0 && (
                <span className="text-gray-600 text-sm">{post.shares}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadPost;
