import PostDetail from "../components/PostDetail";
import { useParams } from "react-router"


export const PostPage = () => {
    const { id } = useParams<{ id: string }>()


    return (

        <PostDetail postId={Number(id)} />
    );
};