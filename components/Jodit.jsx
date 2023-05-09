import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import parse from 'html-react-parser'
import { useMemo, useRef } from 'react'

const Jodit = ({ content, setContent }) => {
  const editor = useRef(null)

  return (
    <div className='text-black w-1/2 lg:w-full lg:pr-4 rounded-full'>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        onChange={(event, editor) => {
          const data = editor.getData()
          setContent(data)
        }}
      />
    </div>
  )
}
export default Jodit
