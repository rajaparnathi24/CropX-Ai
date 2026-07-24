from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import CommunityPost, CommunityComment
from schemas import PostCreate, PostResponse, CommentCreate, CommentResponse

router = APIRouter(prefix="/community", tags=["Farmer Community"])

@router.get("/posts", response_model=List[PostResponse])
def get_community_posts(db: Session = Depends(get_db)):
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).all()
    result = []
    for post in posts:
        comments_list = [
            CommentResponse(
                id=c.id,
                postId=c.post_id,
                authorName=c.author_name,
                authorLocation=c.author_location,
                content=c.content,
                createdAt=c.created_at
            ) for c in post.comments
        ]
        result.append(
            PostResponse(
                id=post.id,
                authorName=post.author_name,
                authorLocation=post.author_location,
                cropCategory=post.crop_category,
                title=post.title,
                content=post.content,
                imageUrl=post.image_url,
                likes=int(post.likes or 0),
                commentsCount=len(comments_list),
                comments=comments_list,
                createdAt=post.created_at
            )
        )
    return result

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_community_post(post_data: PostCreate, db: Session = Depends(get_db)):
    new_post = CommunityPost(
        author_name=post_data.authorName,
        author_location=post_data.authorLocation,
        crop_category=post_data.cropCategory,
        title=post_data.title,
        content=post_data.content,
        image_url=post_data.imageUrl,
        likes=0
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return PostResponse(
        id=new_post.id,
        authorName=new_post.author_name,
        authorLocation=new_post.author_location,
        cropCategory=new_post.crop_category,
        title=new_post.title,
        content=new_post.content,
        imageUrl=new_post.image_url,
        likes=0,
        commentsCount=0,
        comments=[],
        createdAt=new_post.created_at
    )

@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: str, comment_data: CommentCreate, db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Community post not found")

    new_comment = CommunityComment(
        post_id=post_id,
        author_name=comment_data.authorName,
        author_location=comment_data.authorLocation,
        content=comment_data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        postId=new_comment.post_id,
        authorName=new_comment.author_name,
        authorLocation=new_comment.author_location,
        content=new_comment.content,
        createdAt=new_comment.created_at
    )

@router.post("/posts/{post_id}/like")
def like_community_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Community post not found")

    post.likes = (post.likes or 0) + 1
    db.commit()
    return {"id": post_id, "likes": int(post.likes)}
