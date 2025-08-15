// API配置
const API_BASE_URL = 'http://localhost:8000/api';

// API请求工具类
class BlogAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, finalOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // ==================== 栏目相关API ====================
    
    // 获取所有栏目
    async getCategories() {
        return await this.request('/categories/');
    }

    // 获取单个栏目
    async getCategory(id) {
        return await this.request(`/categories/${id}/`);
    }

    // 创建栏目
    async createCategory(categoryData) {
        return await this.request('/categories/', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    // 更新栏目
    async updateCategory(id, categoryData) {
        return await this.request(`/categories/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    // 删除栏目
    async deleteCategory(id) {
        return await this.request(`/categories/${id}/`, {
            method: 'DELETE'
        });
    }

    // 获取栏目下的文章
    async getCategoryPosts(id) {
        return await this.request(`/categories/${id}/posts/`);
    }

    // ==================== 文章相关API ====================
    
    // 获取所有文章
    async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/posts/?${queryString}` : '/posts/';
        return await this.request(endpoint);
    }

    // 获取单个文章
    async getPost(id) {
        return await this.request(`/posts/${id}/`);
    }

    // 创建文章
    async createPost(postData) {
        return await this.request('/posts/', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    // 更新文章
    async updatePost(id, postData) {
        return await this.request(`/posts/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    // 删除文章
    async deletePost(id) {
        return await this.request(`/posts/${id}/`, {
            method: 'DELETE'
        });
    }

    // 获取推荐文章
    async getFeaturedPosts() {
        return await this.request('/posts/featured/');
    }

    // 按栏目获取文章
    async getPostsByCategory(categoryId) {
        return await this.request(`/posts/by_category/?category_id=${categoryId}`);
    }

    // 增加文章浏览次数
    async incrementViews(id) {
        return await this.request(`/posts/${id}/increment_views/`, {
            method: 'POST'
        });
    }

    // ==================== 用户相关API ====================
    
    // 用户登录
    async login(credentials) {
        return await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    // 用户注册
    async register(userData) {
        return await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // 获取当前用户信息
    async getCurrentUser() {
        return await this.request('/auth/user/');
    }

    // 用户登出
    async logout() {
        return await this.request('/auth/logout/', {
            method: 'POST'
        });
    }

    // ==================== 工具方法 ====================
    
    // 检查用户是否已登录
    isLoggedIn() {
        return localStorage.getItem('authToken') !== null;
    }

    // 设置认证token
    setAuthToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // 获取认证token
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // 带认证的请求
    async authenticatedRequest(endpoint, options = {}) {
        const token = this.getAuthToken();
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }
        return await this.request(endpoint, options);
    }
}

// 创建全局API实例
window.blogAPI = new BlogAPI();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog API 已加载');
    
    // 检查用户登录状态
    if (window.blogAPI.isLoggedIn()) {
        console.log('用户已登录');
    } else {
        console.log('用户未登录');
    }
    
    // 示例：在页面上显示文章列表
    if (document.getElementById('posts-container')) {
        loadPosts();
    }
    
    // 示例：在页面上显示栏目列表
    if (document.getElementById('categories-container')) {
        loadCategories();
    }
});

// 加载文章列表
async function loadPosts(params = {}) {
    try {
        const posts = await window.blogAPI.getPosts(params);
        displayPosts(posts);
    } catch (error) {
        console.error('加载文章失败:', error);
    }
}

// 显示文章列表
function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = '';
    
    posts.results.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.innerHTML = `
            <h3><a href="/post/${post.slug}">${post.title}</a></h3>
            <p>${post.excerpt || post.content.substring(0, 200)}...</p>
            <div class="post-meta">
                <span>作者: ${post.author}</span>
                <span>栏目: ${post.category}</span>
                <span>状态: ${post.status}</span>
                <span>浏览: ${post.views}</span>
                <span>发布时间: ${new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
            </div>
        `;
        container.appendChild(postElement);
    });
}

// 加载栏目列表
async function loadCategories() {
    try {
        const categories = await window.blogAPI.getCategories();
        displayCategories(categories);
    } catch (error) {
        console.error('加载栏目失败:', error);
    }
}

// 显示栏目列表
function displayCategories(categories) {
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = '';
    
    categories.results.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <h4><a href="/category/${category.slug}">${category.name}</a></h4>
            <p>${category.description}</p>
            <small>文章数: ${category.post_count}</small>
        `;
        container.appendChild(categoryElement);
    });
}
