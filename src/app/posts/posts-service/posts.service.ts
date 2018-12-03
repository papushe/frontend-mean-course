import {Injectable} from '@angular/core';
import {Post} from '../post.model';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../../auth/auth-service/auth.service';
import {environment} from '../../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
  }

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
      .pipe(map(postData => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }), maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postDate: Post | FormData;
    if (typeof(image) === 'object') {
      postDate = new FormData();
      postDate.append('id', id);
      postDate.append('title', title);
      postDate.append('content', content);
      postDate.append('image', image, title);
    } else {
      postDate = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put(BACKEND_URL + id, postDate)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>
    (BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postDate = new FormData();
    postDate.append('title', title);
    postDate.append('content', content);
    postDate.append('image', image, title);
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postDate)
      .subscribe((responseData) => {
        this.router.navigate(['/']);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }

}
