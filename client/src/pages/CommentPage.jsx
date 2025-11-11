import React, { useState } from "react";
import { Heart, ArrowLeft, MoreHorizontal } from "lucide-react";

// Fake API data
const MOCK_COMMENTS = [
  {
    id: 1,
    postId: 1,
    parentId: null,
    level: 0,
    username: "Khánh Linh",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "6 giờ",
    content:
      "T đi nhớ răng khôn xin bsi cái răng về trêu con. Vừa giờ ra nó báo ơi me ơi răng con chó à 🤣",
    likes: 1400,
    replies: [],
  },
  {
    id: 2,
    postId: 1,
    parentId: 1,
    level: 1,
    username: "Ngọc Mít",
    avatar: "https://i.pravatar.cc/150?img=2",
    time: "5 giờ",
    content: "Khánh mà làm cười rụng cả con, tí thi đê 😂",
    likes: 23,
    replies: [],
  },
  {
    id: 3,
    postId: 1,
    parentId: 1,
    level: 1,
    username: "Lê Kim Bảo",
    avatar: "https://i.pravatar.cc/150?img=3",
    time: "5 giờ",
    content: "Khánh Linh giận tím người 🤣",
    likes: 3,
    replies: [],
  },
  {
    id: 4,
    postId: 1,
    parentId: 3,
    level: 2,
    username: "Khánh Linh",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "5 giờ",
    content: "Dỗi con luôn ấy chứ bác ơi =)))))",
    likes: 0,
    replies: [],
  },
  {
    id: 5,
    postId: 1,
    parentId: 1,
    level: 1,
    username: "Trần Diễm Hằng",
    avatar: "https://i.pravatar.cc/150?img=4",
    time: "5 giờ",
    content: "Khánh Linh Nguyễn Huỳnh Thúy Tiên",
    likes: 0,
    replies: [],
  },
];

const MOCK_POST = {
  id: 1,
  username: "duy",
  time: "3h",
  content: "đế vương phải có long ngai!",
  media: [
    {
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=600",
      type: "image",
    },
  ],
  likes: 60,
  comments: 5,
  reposts: 4,
  shares: 0,
};

// Single Comment Component with vertical line
const Comment = ({
  comment,
  level,
  onReply,
  showReplyInput,
  isLast,
  hasMoreSiblings,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(level === 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="relative flex gap-3">
      {/* Vertical line - only show for nested comments */}
      {level > 0 && (
        <div
          className="absolute left-5 top-0 w-0.5 bg-gray-200"
          style={{ height: isLast && !hasReplies ? "40px" : "100%" }}
        />
      )}

      {/* Horizontal connecting line */}
      {level > 0 && (
        <div className="absolute left-5 top-5 w-6 h-0.5 bg-gray-200" />
      )}

      {/* Avatar */}
      <div className={`relative z-10 ${level > 0 ? "ml-11" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0">
          {comment.avatar && (
            <img
              src={comment.avatar}
              alt={comment.username}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>

        {/* Vertical line continuing down from avatar for parent comments with replies */}
        {level === 0 && hasReplies && showReplies && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-12 w-0.5 bg-gray-200"
            style={{ height: "calc(100% - 48px)" }}
          />
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-grow min-w-0">
        <div className="bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full">
          <div className="font-semibold text-[15px] mb-0.5">
            {comment.username}
          </div>
          <p className="text-[15px] whitespace-pre-line break-words">
            {comment.content}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-1.5 ml-3">
          <span className="text-gray-500 text-xs">{comment.time}</span>
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
            onClick={() => onReply(comment.id)}
            className="text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
          >
            Trả lời
          </button>
        </div>

        {/* Show replies button for root comments */}
        {level === 0 && hasReplies && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="text-gray-600 text-sm font-semibold mt-3 ml-3 hover:text-gray-800 transition"
          >
            — Xem {comment.replies.length} phản hồi
          </button>
        )}

        {/* Hide replies button */}
        {level === 0 && hasReplies && showReplies && (
          <button
            onClick={() => setShowReplies(false)}
            className="text-gray-600 text-sm font-semibold mt-3 ml-3 hover:text-gray-800 transition"
          >
            — Ẩn phản hồi
          </button>
        )}

        {/* Reply input for nested comments */}
        {showReplyInput === comment.id && level > 0 && (
          <div className="mt-3 flex gap-2 ml-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Trả lời ${comment.username}...`}
              className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Nested replies */}
        {showReplies && hasReplies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply, index) => (
              <Comment
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                showReplyInput={showReplyInput}
                isLast={index === comment.replies.length - 1}
                hasMoreSiblings={index < comment.replies.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Comment Thread Page
const CommentPage = () => {
  const [post, setPost] = useState(MOCK_POST);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleReply = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parentId === null) {
        rootComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      postId: post.id,
      parentId: replyingTo || null,
      level: replyingTo ? 1 : 0,
      username: "You",
      avatar: "https://i.pravatar.cc/150?img=50",
      time: "Vừa xong",
      content: commentText,
      likes: 0,
      replies: [],
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setReplyingTo(null);
  };

  const commentTree = buildCommentTree(comments);
  const level0Comments = commentTree.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-4">
        {/* Inline Header */}
        <div className="bg-white rounded-t-2xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-full -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-grow">
            <h1 className="font-semibold text-base">Thread</h1>
            <p className="text-gray-500 text-xs">5.5K views</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full -mr-2">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Original Post - no tree line */}
        <div className="bg-white border-x border-gray-200 px-4 py-4 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0" />

            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[15px]">
                    {post.username}
                  </span>
                  <span className="text-gray-500 text-sm">{post.time}</span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[15px] mb-3 whitespace-pre-line">
                {post.content}
              </p>

              {post.media && post.media.length > 0 && (
                <div className="rounded-2xl overflow-hidden bg-gray-100 mb-3 max-h-[400px]">
                  <img
                    src={post.media[0].url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-5 mt-3">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 hover:opacity-70 transition group"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      liked ? "fill-red-500 text-red-500" : "text-gray-700"
                    } group-hover:scale-110 transition-transform`}
                  />
                  {likeCount > 0 && (
                    <span className="text-gray-600 text-sm">{likeCount}</span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-sm">{comments.length}</span>
                </div>

                <button className="flex items-center gap-2 hover:opacity-70 transition">
                  <svg
                    className="w-5 h-5 text-gray-700"
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
                    <span className="text-sm">{post.reposts}</span>
                  )}
                </button>

                <button className="flex items-center gap-2 hover:opacity-70 transition">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  {post.shares > 0 && (
                    <span className="text-sm">{post.shares}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border-x border-gray-200 px-4 pb-4">
          <div className="space-y-6 pt-4">
            {level0Comments.map((comment, index) => (
              <Comment
                key={comment.id}
                comment={comment}
                level={0}
                onReply={handleReply}
                showReplyInput={replyingTo}
                isLast={index === level0Comments.length - 1}
                hasMoreSiblings={index < level0Comments.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Comment Input - Separate rounded box at bottom */}
        <div className="bg-white rounded-b-2xl border border-gray-200 px-4 py-3 mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-grow bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className={`transition ${
                commentText.trim()
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPage;
