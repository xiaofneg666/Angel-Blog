import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// 导入页面组件
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import PostListView from '@/views/PostListView.vue';
import PostDetailView from '@/views/PostDetailView.vue';
import CreatePostView from '@/views/CreatePostView.vue';
import EditPostView from '@/views/EditPostView.vue';
import LinksView from '@/views/LinksView.vue';
import BoardView from '@/views/BoardView.vue';
import AboutView from '@/views/AboutView.vue';
import ArchiveView from '@/views/ArchiveView.vue';
import CategoryView from '@/views/CategoryView.vue';
import TagView from '@/views/TagView.vue';
import GameView from '@/views/GameView.vue';
import MusicView from '@/views/MusicView.vue';
import AdminHmoeView from '@/views/AdminHmoeView.vue'; // Fixed import path
import MyHomeView from '@/views/MyHomeView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页 - Angel' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录 - Angel' }
  },
  {
    path: '/myhomeview/:id',
    name: 'myhomeview',
    component: MyHomeView,
    meta: { title: '个人主页 - Angel' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: '注册 - Angel' }
  },
  {
    path: '/posts',
    name: 'posts',
    component: PostListView,
    meta: { title: '文章列表 - Angel' }
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: PostDetailView,
    meta: { title: '文章详情 - Angel' }
  },
  {
    path: '/posts/create',
    name: 'create-post',
    component: CreatePostView,
    meta: { 
      requiresAuth: true,
      title: '创建文章 - Angel' 
    }
  },
  {
    path: '/posts/:id/edit',
    name: 'edit-post',
    component: EditPostView,
    meta: { 
      requiresAuth: true,
      title: '编辑文章 - Angel' 
    }
  },
  {
    path: '/links',
    name: 'links',
    component: LinksView,
    meta: { title: '友情链接 - Angel' }
  },
  {
    path: '/board',
    name: 'board',
    component: BoardView,
    meta: { title: '留言板 - Angel' }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { title: '关于 - Angel' }
  },
  {
    path: '/archive',
    name: 'archive',
    component: ArchiveView,
    meta: { title: '归档 - Angel' }
  },
  {
    path: '/category',
    name: 'category',
    component: CategoryView,
    meta: { title: '分类 - Angel' }
  },
  {
    path: '/tag',
    name: 'tag',
    component: TagView,
    meta: { title: '标签 - Angel' }
  },
  {
    path: '/game',
    name: 'game',
    component: GameView,
    meta: { title: '游戏 - Angel' }
  },
  {
    path: '/music',
    name: 'music',
    component: MusicView,
    meta: { title: '音乐 - Angel' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminHmoeView,
    meta: { 
      title: '后台管理 - Angel',
      requiresAdmin: true 
    },
    children: [
      { 
        path: 'dashboard', 
        name: 'admin-dashboard', 
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '仪表盘 - 后台管理' }
      },
      { 
        path: 'articles', 
        name: 'admin-articles', 
        component: () => import('@/views/admin/ArticleManagementView.vue'),
        meta: { title: '文章管理 - 后台管理' }
      },
      { 
        path: 'articles/new', 
        name: 'admin-article-new', 
        component: () => import('@/views/admin/ArticleEditView.vue'),
        meta: { title: '新建文章 - 后台管理' }
      },
      { 
        path: 'articles/edit/:id', 
        name: 'admin-article-edit', 
        component: () => import('@/views/admin/ArticleEditView.vue'),
        meta: { title: '编辑文章 - 后台管理' }
      },
      { 
        path: 'users', 
        name: 'admin-users', 
        component: () => import('@/views/admin/UserManagementView.vue'),
        meta: { title: '用户管理 - 后台管理' }
      },
      { 
        path: 'comments', 
        name: 'admin-comments', 
        component: () => import('@/views/admin/CommentManagementView.vue'),
        meta: { title: '评论管理 - 后台管理' }
      },
      { 
        path: 'categories', 
        name: 'admin-categories', 
        component: () => import('@/views/admin/CategoryManagementView.vue'),
        meta: { title: '分类管理 - 后台管理' }
      },
      { 
        path: 'settings', 
        name: 'admin-settings', 
        component: () => import('@/views/admin/SettingsView.vue'),
        meta: { title: '系统设置 - 后台管理' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 设置页面标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'Angel';
  }

  // 检查需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    });
    return;
  }

  // 检查需要管理员权限的路由
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
      next('/login');
      return;
    }
  }

  next();
});

export default router;