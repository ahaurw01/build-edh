import { ToastProgrammatic as Toast } from 'buefy'

export default function({ $auth }) {
  $auth.onError(() => {
    Toast.open({ message: 'Problem logging in.', type: 'is-danger' })
  })
}
