/**
 * CKEditor 5 Component - Decoupled Document Editor
 * Trình soạn thảo CKEditor 5 với đầy đủ tính năng
 */

"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import {
  DecoupledEditor,
  Autosave,
  Essentials,
  Paragraph,
  CloudServices,
  Autoformat,
  TextTransformation,
  LinkImage,
  Link,
  ImageBlock,
  ImageToolbar,
  BlockQuote,
  Bold,
  Bookmark,
  CKBox,
  ImageUpload,
  ImageInsert,
  ImageInsertViaUrl,
  AutoImage,
  PictureEditing,
  CKBoxImageEdit,
  CodeBlock,
  TableColumnResize,
  Table,
  TableToolbar,
  Emoji,
  Mention,
  PasteFromOffice,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Fullscreen,
  Heading,
  HorizontalLine,
  ImageCaption,
  ImageResize,
  ImageStyle,
  Indent,
  IndentBlock,
  Code,
  Italic,
  AutoLink,
  ListProperties,
  List,
  MediaEmbed,
  RemoveFormat,
  SpecialCharactersArrows,
  SpecialCharacters,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  TableCaption,
  TableCellProperties,
  TableProperties,
  Alignment,
  TodoList,
  Underline,
  TextPartLanguage,
  BalloonToolbar,
  Highlight,
  ShowBlocks,
  HtmlEmbed,
} from "ckeditor5"
import {
  AIChat,
  AIEditorIntegration,
  AIQuickActions,
  AIReviewMode,
  PasteFromOfficeEnhanced,
  FormatPainter,
  LineHeight,
  Comments,
  TrackChanges,
  TrackChangesData,
  SlashCommand,
  MultiLevelList,
  ExportWord,
  ExportPdf,
  ImportWord,
} from "ckeditor5-premium-features"
import "ckeditor5/ckeditor5.css"
import "ckeditor5-premium-features/ckeditor5-premium-features.css"
import "./ckeditor-styles.css"

const LICENSE_KEY = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NjY0NDc5OTksImp0aSI6IjExNTBlNTM1LTQwODgtNGRjYy1iZmI5LTgzNGExYTllMGM2OSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjNmZjdkZTA5In0.Q_lD27rSEO5mfVSAxlv0SmMsORWRMMJyQF2VSrXoFaqfipgLZUYuW8ufZ8ufgc-r41Fkc_AoYpjwwjCcCZaayw'

const DEFAULT_HEX_COLORS = [
  { color: '#000000', label: 'Black' },
  { color: '#4D4D4D', label: 'Dim grey' },
  { color: '#999999', label: 'Grey' },
  { color: '#E6E6E6', label: 'Light grey' },
  { color: '#FFFFFF', label: 'White', hasBorder: true },
  { color: '#E65C5C', label: 'Red' },
  { color: '#E69C5C', label: 'Orange' },
  { color: '#E6E65C', label: 'Yellow' },
  { color: '#C2E65C', label: 'Light green' },
  { color: '#5CE65C', label: 'Green' },
  { color: '#5CE6A6', label: 'Aquamarine' },
  { color: '#5CE6E6', label: 'Turquoise' },
  { color: '#5CA6E6', label: 'Light blue' },
  { color: '#5C5CE6', label: 'Blue' },
  { color: '#A65CE6', label: 'Purple' }
]

interface CKEditorComponentProps {
  value: string
  onChange: (data: string) => void
}

export default function CKEditorComponent({ value, onChange }: CKEditorComponentProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorMenuBarRef = useRef<HTMLDivElement>(null)
  const editorToolbarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorCkeditorAiRef = useRef<HTMLDivElement>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  useEffect(() => {
    setIsLayoutReady(true)
    return () => {
      setIsLayoutReady(false)
      // Clean up to prevent "element already used" errors
      if (editorMenuBarRef.current) editorMenuBarRef.current.innerHTML = ''
      if (editorToolbarRef.current) editorToolbarRef.current.innerHTML = ''
      if (editorCkeditorAiRef.current) editorCkeditorAiRef.current.innerHTML = ''
    }
  }, [])

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady || !editorCkeditorAiRef.current) {
      return { editorConfig: null }
    }

    return {
      editorConfig: {
        licenseKey: LICENSE_KEY,
        toolbar: {
          items: [
            'undo',
            'redo',
            '|',
            'toggleAi',
            'aiQuickActions',
            '|',
            'importWord',
            'exportWord',
            'exportPdf',
            'showBlocks',
            'textPartLanguage',
            '|',
            'heading',
            '|',
            'fontSize',
            'fontFamily',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'subscript',
            'superscript',
            'code',
            'removeFormat',
            '|',
            'horizontalLine',
            'link',
            'bookmark',
            'insertImageViaUrl',
            'mediaEmbed',
            'insertTable',
            'highlight',
            'blockQuote',
            'codeBlock',
            'htmlEmbed',
            '|',
            'alignment',
            'lineHeight',
            '|',
            'bulletedList',
            'numberedList',
            'multiLevelList',
            'todoList',
            'outdent',
            'indent'
          ],
          shouldNotGroupWhenFull: false
        },
        plugins: [
          AIChat,
          AIEditorIntegration,
          AIQuickActions,
          AIReviewMode,
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          Bold,
          Bookmark,
          CKBox,
          CKBoxImageEdit,
          CloudServices,
          Code,
          CodeBlock,
          Comments,
          Emoji,
          Essentials,
          ExportPdf,
          ExportWord,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          FormatPainter,
          Fullscreen,
          Heading,
          Highlight,
          HorizontalLine,
          HtmlEmbed,
          ImageBlock,
          ImageCaption,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          ImportWord,
          Indent,
          IndentBlock,
          Italic,
          LineHeight,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          MultiLevelList,
          Paragraph,
          PasteFromOffice,
          PasteFromOfficeEnhanced,
          PictureEditing,
          RemoveFormat,
          ShowBlocks,
          SlashCommand,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextPartLanguage,
          TextTransformation,
          TodoList,
          TrackChanges,
          TrackChangesData,
          Underline
        ],
        ai: {
          container: {
            type: 'sidebar' as const,
            element: editorCkeditorAiRef.current,
            showResizeButton: false
          },
          chat: {
            context: {
              document: {
                enabled: true
              },
              urls: {
                enabled: true
              },
              files: {
                enabled: true
              }
            }
          }
        },
        balloonToolbar: [
          'comment',
          '|',
          'aiQuickActions',
          '|',
          'bold',
          'italic',
          '|',
          'link',
          'insertImage',
          '|',
          'bulletedList',
          'numberedList'
        ],
        cloudServices: {
          tokenUrl: 'https://q2f_l0zfa5q1.cke-cs.com/token/dev/215c28b191a3fa5245ef205a156347ea57dafc4878d576f40e637fc003f5?limit=10',
          webSocketUrl: 'wss://q2f_l0zfa5q1.cke-cs.com/ws'
        },
        collaboration: {
          channelId: 'news-editor-' + Math.random().toString(36).substring(7)
        },
        comments: {
          editorConfig: {
            extraPlugins: [Autoformat, Bold, Italic, List, Mention],
            mention: {
              feeds: [
                {
                  marker: '@',
                  feed: []
                }
              ]
            }
          }
        },
        fontBackgroundColor: {
          colorPicker: {
            format: 'hex'
          },
          colors: DEFAULT_HEX_COLORS
        },
        fontColor: {
          colorPicker: {
            format: 'hex'
          },
          colors: DEFAULT_HEX_COLORS
        },
        fontFamily: {
          supportAllValues: true
        },
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 22],
          supportAllValues: true
        },
        fullscreen: {
          onEnterCallback: (container: any) =>
            container.classList.add(
              'editor-container',
              'editor-container_document-editor',
              'editor-container_contains-wrapper',
              'editor-container_include-fullscreen',
              'main-container'
            )
        },
        heading: {
          options: [
            {
              model: 'paragraph',
              title: 'Paragraph',
              class: 'ck-heading_paragraph'
            },
            {
              model: 'heading1',
              view: 'h1',
              title: 'Heading 1',
              class: 'ck-heading_heading1'
            },
            {
              model: 'heading2',
              view: 'h2',
              title: 'Heading 2',
              class: 'ck-heading_heading2'
            },
            {
              model: 'heading3',
              view: 'h3',
              title: 'Heading 3',
              class: 'ck-heading_heading3'
            },
            {
              model: 'heading4',
              view: 'h4',
              title: 'Heading 4',
              class: 'ck-heading_heading4'
            },
            {
              model: 'heading5',
              view: 'h5',
              title: 'Heading 5',
              class: 'ck-heading_heading5'
            },
            {
              model: 'heading6',
              view: 'h6',
              title: 'Heading 6',
              class: 'ck-heading_heading6'
            }
          ]
        },
        image: {
          toolbar: [
            'toggleImageCaption',
            '|',
            'imageStyle:alignBlockLeft',
            'imageStyle:block',
            'imageStyle:alignBlockRight',
            '|',
            'resizeImage',
            '|',
            'ckboxImageEdit'
          ],
          styles: {
            options: ['alignBlockLeft', 'block', 'alignBlockRight']
          }
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file'
              }
            }
          }
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true
          }
        },
        menuBar: {
          isVisible: true
        },
        placeholder: 'Nhập nội dung tin tức tại đây...',
        initialData: value,
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
        },
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage'
          ]
        }
      }
    }
  }, [isLayoutReady])

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_document-editor"
        ref={editorContainerRef}
      >
        <div className="editor-container__menu-bar" ref={editorMenuBarRef}></div>
        <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
        <div className="editor-container__editor-wrapper">
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {editorConfig && (
                <CKEditor
                  key={isLayoutReady ? "editor-ready" : "editor-loading"}
                  onReady={(editor: any) => {
                    if (editorToolbarRef.current) {
                      editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element)
                    }
                    if (editorMenuBarRef.current) {
                      editorMenuBarRef.current.appendChild(editor.ui.view.menuBarView.element)
                    }
                  }}
                  onAfterDestroy={() => {
                    if (editorToolbarRef.current) {
                      Array.from(editorToolbarRef.current.children).forEach(child => child.remove())
                    }
                    if (editorMenuBarRef.current) {
                      Array.from(editorMenuBarRef.current.children).forEach(child => child.remove())
                    }
                  }}
                  onChange={(event: any, editor: any) => {
                    try {
                      const data = editor.getData()
                      onChange(data)
                    } catch (error) {
                      console.warn('CKEditor onChange error:', error)
                    }
                  }}
                  onError={(error: any, { willEditorRestart }: any) => {
                    console.warn('CKEditor error:', error)
                    // If the editor will restart, we don't need to do anything
                    if (willEditorRestart) {
                      console.log('Editor will restart automatically')
                    }
                  }}
                  editor={DecoupledEditor}
                  config={editorConfig}
                />
              )}
            </div>
          </div>
          <div className="editor-container__sidebar_ckeditor-ai" ref={editorCkeditorAiRef}></div>
        </div>
      </div>
    </div>
  )
}
