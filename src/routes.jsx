import { useLoaderData } from 'react-router-dom'
import { Blog } from './pages/Blog.jsx'
import { Signup } from './pages/Signup.jsx'
import { Login } from './pages/Login.jsx'
import { getPosts } from './api/posts.js'
import { getUserInfo } from './api/users.js'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'

export const routes = [
  {
    path: '/',
    loader: async () => {
      const queryClient = new QueryClient()
      const author = ''
      const sortBy = 'createdAt'
      const sortOrder = 'descending'
      const posts = await getPosts({ author, sortBy, sortOrder })
      await queryClient.prefetchQuery({
        // Теперь мы можем вызвать queryClient.prefetchQuery с тем же ключом запроса, что и тот, который будет использоваться перехватчиком useQuery в компоненте, для предварительной выборки результатов запроса:
        queryKey: ['posts', { author, sortBy, sortOrder }],
        queryFn: () => posts,
      })
      const uniqueAuthors = posts // мы используем массив выбранных сообщений, чтобы получить из них уникальный список идентификаторов авторов:
        .map((post) => post.author)
        .filter((value, index, array) => array.indexOf(value) === index)
      for (const userId of uniqueAuthors) {
        // перебираем все идентификаторы авторов и предварительно извлекаем их информацию:
        await queryClient.prefetchQuery({
          queryKey: ['users', userId],
          queryFn: () => getUserInfo(userId),
        })
      }
      return dehydrate(queryClient) // когда мы предварительно извлекли все необходимые данные, нам нужно вызвать dehydrate в queryClient, чтобы вернуть их в сериализуемом формате:
    },
    Component() {
      // мы получаем это обезвоженное состояние и используем компонент Hydrate для его повторной гидратации. Этот процесс гидратации делает данные доступными для клиента запросов, выполняемых на стороне сервера:
      const dehydratedState = useLoaderData()
      return (
        <HydrationBoundary state={dehydratedState}>
          <Blog />
        </HydrationBoundary>
      )
    },
  },
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
]
