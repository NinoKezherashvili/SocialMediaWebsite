import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../supabase-client"
import type { Comment } from "./CommentSection"
import { useState } from "react"

interface Props {
    comment: Comment & Comment & {
        children?: Comment[]
    }
    postId: number
}

const createReply = async (replyContent: string, postId: number, parentComnentId: number, userId?: string, author?: string) => {
    if (!userId || !author) {
        throw new Error("You must be logged in to reply.");
    }

    const { error } = await supabase.from("comments").insert({
        content: replyContent,
        post_id: postId,
        parent_comment_id: parentComnentId,
        user_id: userId,
        author: author,
    });

    if (error) throw new Error(error.message);
}


const CommentItem = ({ comment, postId }: Props) => {
    const [showReply, setShowReply] = useState<boolean>(false)
    const [replyText, setReplyText] = useState<string>('')
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { mutate, isPending, isError } = useMutation({
        mutationFn: (replyContent: string) =>
            createReply(
                replyContent,
                postId,
                comment.id,
                user?.id,
                user?.user_metadata?.user_name
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setReplyText("");
            setShowReply(false)
        },
    });


    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText) return;
        mutate(replyText);

    };

    return (
        <div>
            <div>
                <div>
                    {/* Display the commenters username */}
                    <span>{comment.author}</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p>{comment.content}</p>
                <button onClick={() => setShowReply(prev => !prev)}>
                    {showReply ? 'Cancel' : 'Reply'}
                </button>

            </div>
            {showReply && user && (
                <form onSubmit={handleReplySubmit} className="mb-4">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full border border-white/10 bg-transparent p-2 rounded"
                        placeholder="Write a reply..."
                        rows={2}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        {isPending ? "Posting..." : "Post Reply"}
                    </button>
                    {isError && (
                        <p className="text-red-500 mt-2">Error posting reply.</p>
                    )}
                </form>
            )}

        </div>
    )
}

export default CommentItem