/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoRgrANARATAdATjgBitAHGAbGA7DBMAZkyLGQPUwRqxAN3SyJnV1xrHRBDsawAs6NFABuASzREIoCCAjI5SkAF1ouAUWQIYMKCqA===
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    DecoupledEditor,
    Autosave,
    Essentials,
    Paragraph,
    CloudServices,
    TableColumnResize,
    Table,
    TableToolbar,
    TableCaption,
    TableCellProperties,
    TableProperties,
    TextPartLanguage,
    WordCount,
    Title,
    PasteFromOffice,
    MediaEmbed,
    Markdown,
    PasteFromMarkdownExperimental,
    List,
    TodoList,
    ListProperties,
    ImageInline,
    ImageToolbar,
    ImageBlock,
    ImageResize,
    ImageUpload,
    ImageInsertViaUrl,
    AutoImage,
    ImageStyle,
    ImageCaption,
    ImageTextAlternative,
    Heading,
    Link,
    AutoLink,
    Bookmark,
    BlockQuote,
    HorizontalLine,
    CodeBlock,
    Indent,
    IndentBlock,
    Alignment,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Subscript,
    Superscript,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    RemoveFormat,
    Highlight,
    Mention,
    ImageUtils,
    ImageEditing,
    ShowBlocks,
    GeneralHtmlSupport,
    HtmlEmbed,
    HtmlComment,
    FullPage,
    BalloonToolbar
} from 'ckeditor5';
import {
    getEmailInlineStylesTransformations,
    AIChat,
    AIEditorIntegration,
    AIQuickActions,
    AIReviewMode,
    EmailConfigurationHelper,
    ExportWord,
    ExportPdf,
    ImportWord,
    ExportInlineStyles,
    MultiLevelList,
    LineHeight,
    SourceEditingEnhanced
} from 'ckeditor5-premium-features';

import translations from 'ckeditor5/translations/vi.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/vi.js';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

import './App.css';

const LICENSE_KEY =
    'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NjY0NDc5OTksImp0aSI6IjExNTBlNTM1LTQwODgtNGRjYy1iZmI5LTgzNGExYTllMGM2OSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjNmZjdkZTA5In0.Q_lD27rSEO5mfVSAxlv0SmMsORWRMMJyQF2VSrXoFaqfipgLZUYuW8ufZ8ufgc-r41Fkc_AoYpjwwjCcCZaayw';

/**
 * Unique ID that will be used to identify this document. E.g. you may use ID taken from your database.
 * Read more: https://ckeditor.com/docs/ckeditor5/latest/api/module_collaboration-core_config-RealTimeCollaborationConfig.html
 */
const DOCUMENT_ID = '<YOUR_DOCUMENT_ID>';

const CLOUD_SERVICES_TOKEN_URL =
    'https://q2f_l0zfa5q1.cke-cs.com/token/dev/215c28b191a3fa5245ef205a156347ea57dafc4878d576f40e637fc003f5?limit=10';
const CLOUD_SERVICES_WEBSOCKET_URL = 'wss://q2f_l0zfa5q1.cke-cs.com/ws';

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
];

export default function App() {
    const editorContainerRef = useRef(null);
    const editorMenuBarRef = useRef(null);
    const editorToolbarRef = useRef(null);
    const editorRef = useRef(null);
    const editorCkeditorAiRef = useRef(null);
    const editorWordCountRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    useEffect(() => {
        setIsLayoutReady(true);

        return () => setIsLayoutReady(false);
    }, []);

    const { editorConfig } = useMemo(() => {
        if (!isLayoutReady) {
            return {};
        }

        return {
            editorConfig: {
                toolbar: {
                    items: [
                        'undo',
                        'redo',
                        '|',
                        'toggleAi',
                        'aiQuickActions',
                        '|',
                        'sourceEditingEnhanced',
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
                    AutoImage,
                    AutoLink,
                    Autosave,
                    BalloonToolbar,
                    BlockQuote,
                    Bold,
                    Bookmark,
                    CloudServices,
                    Code,
                    CodeBlock,
                    EmailConfigurationHelper,
                    Essentials,
                    ExportInlineStyles,
                    ExportPdf,
                    ExportWord,
                    FontBackgroundColor,
                    FontColor,
                    FontFamily,
                    FontSize,
                    FullPage,
                    GeneralHtmlSupport,
                    Heading,
                    Highlight,
                    HorizontalLine,
                    HtmlComment,
                    HtmlEmbed,
                    ImageBlock,
                    ImageCaption,
                    ImageEditing,
                    ImageInline,
                    ImageInsertViaUrl,
                    ImageResize,
                    ImageStyle,
                    ImageTextAlternative,
                    ImageToolbar,
                    ImageUpload,
                    ImageUtils,
                    ImportWord,
                    Indent,
                    IndentBlock,
                    Italic,
                    LineHeight,
                    Link,
                    List,
                    ListProperties,
                    Markdown,
                    MediaEmbed,
                    Mention,
                    MultiLevelList,
                    Paragraph,
                    PasteFromMarkdownExperimental,
                    PasteFromOffice,
                    RemoveFormat,
                    ShowBlocks,
                    SourceEditingEnhanced,
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
                    Title,
                    TodoList,
                    Underline,
                    WordCount
                ],
                ai: {
                    container: {
                        type: 'sidebar',
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
                balloonToolbar: ['aiQuickActions', '|', 'bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
                cloudServices: {
                    tokenUrl: CLOUD_SERVICES_TOKEN_URL,
                    webSocketUrl: CLOUD_SERVICES_WEBSOCKET_URL
                },
                collaboration: {
                    channelId: DOCUMENT_ID
                },
                exportInlineStyles: {
                    stylesheets: [
                        /* This path should point to the content stylesheets on your assets server. */
                        /* See: https://ckeditor.com/docs/ckeditor5/latest/features/export-with-inline-styles.html */
                        './export-style.css',
                        /* Export inline styles needs access to stylesheets that style the content. */
                        'https://cdn.ckeditor.com/ckeditor5/47.3.0/ckeditor5.css',
                        'https://cdn.ckeditor.com/ckeditor5-premium-features/47.3.0/ckeditor5-premium-features.css'
                    ],
                    transformations: getEmailInlineStylesTransformations()
                },
                exportPdf: {
                    stylesheets: [
                        /* This path should point to the content stylesheets on your assets server. */
                        /* See: https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html */
                        './export-style.css',
                        /* Export PDF needs access to stylesheets that style the content. */
                        'https://cdn.ckeditor.com/ckeditor5/47.3.0/ckeditor5.css',
                        'https://cdn.ckeditor.com/ckeditor5-premium-features/47.3.0/ckeditor5-premium-features.css'
                    ],
                    fileName: 'export-pdf-demo.pdf',
                    converterOptions: {
                        format: 'A4',
                        margin_top: '20mm',
                        margin_bottom: '20mm',
                        margin_right: '12mm',
                        margin_left: '12mm',
                        page_orientation: 'portrait'
                    }
                },
                exportWord: {
                    stylesheets: [
                        /* This path should point to the content stylesheets on your assets server. */
                        /* See: https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html */
                        './export-style.css',
                        /* Export Word needs access to stylesheets that style the content. */
                        'https://cdn.ckeditor.com/ckeditor5/47.3.0/ckeditor5.css',
                        'https://cdn.ckeditor.com/ckeditor5-premium-features/47.3.0/ckeditor5-premium-features.css'
                    ],
                    fileName: 'export-word-demo.docx',
                    converterOptions: {
                        document: {
                            orientation: 'portrait',
                            size: 'A4',
                            margins: {
                                top: '20mm',
                                bottom: '20mm',
                                right: '12mm',
                                left: '12mm'
                            }
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
                htmlSupport: {
                    allow: [
                        {
                            name: /^(div|table|tbody|tr|td|span|img|h1|h2|h3|p|a)$/,
                            styles: true,
                            attributes: true,
                            classes: true
                        }
                    ]
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
                },
                initialData:
                    '<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou\'ve successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What\'s next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor\'s\n\t\tconfiguration to match your application\'s style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don\'t hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<ul>\n\t<li>📝 <a href="https://portal.ckeditor.com/checkout?plan=free">Trial sign up</a>,</li>\n\t<li>📕 <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/index.html">Documentation</a>,</li>\n\t<li>⭐️ <a href="https://github.com/ckeditor/ckeditor5">GitHub</a> (star us if you can!),</li>\n\t<li>🏠 <a href="https://ckeditor.com">CKEditor Homepage</a>,</li>\n\t<li>🧑‍💻 <a href="https://ckeditor.com/ckeditor-5/demo/">CKEditor 5 Demos</a>,</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser\'s\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n',
                language: 'vi',
                licenseKey: LICENSE_KEY,
                lineHeight: {
                    supportAllValues: true
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
                        reversed: false
                    }
                },
                mention: {
                    feeds: [
                        {
                            marker: '@',
                            feed: [
                                /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
                            ]
                        }
                    ]
                },
                placeholder: 'Type or paste your content here!',
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
                    tableProperties: {
                        borderColors: DEFAULT_HEX_COLORS,
                        backgroundColors: DEFAULT_HEX_COLORS
                    },
                    tableCellProperties: {
                        borderColors: DEFAULT_HEX_COLORS,
                        backgroundColors: DEFAULT_HEX_COLORS
                    }
                },
                translations: [translations, premiumFeaturesTranslations]
            }
        };
    }, [isLayoutReady]);

    useEffect(() => {
        if (editorConfig) {
            configUpdateAlert(editorConfig);
        }
    }, [editorConfig]);

    return (
        <div className="main-container">
            <div
                className="editor-container editor-container_document-editor editor-container_contains-wrapper editor-container_include-word-count"
                ref={editorContainerRef}
            >
                <div className="editor-container__menu-bar" ref={editorMenuBarRef}></div>
                <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
                <div className="editor-container__editable-wrapper">
                    <div className="editor-container__editor-wrapper">
                        <div className="editor-container__editor">
                            <div ref={editorRef}>
                                {editorConfig && (
                                    <CKEditor
                                        onReady={editor => {
                                            const wordCount = editor.plugins.get('WordCount');
                                            editorWordCountRef.current.appendChild(wordCount.wordCountContainer);
                                            editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                                            editorMenuBarRef.current.appendChild(editor.ui.view.menuBarView.element);
                                        }}
                                        onAfterDestroy={() => {
                                            Array.from(editorWordCountRef.current.children).forEach(child => child.remove());
                                            Array.from(editorToolbarRef.current.children).forEach(child => child.remove());
                                            Array.from(editorMenuBarRef.current.children).forEach(child => child.remove());
                                        }}
                                        editor={DecoupledEditor}
                                        config={editorConfig}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="editor-container__sidebar editor-container__sidebar_ckeditor-ai" ref={editorCkeditorAiRef}></div>
                </div>
                <div className="editor_container__word-count" ref={editorWordCountRef}></div>
            </div>
        </div>
    );
}

/**
 * This function exists to remind you to update the config needed for premium features.
 * The function can be safely removed. Make sure to also remove call to this function when doing so.
 */
function configUpdateAlert(config) {
    if (configUpdateAlert.configUpdateAlertShown) {
        return;
    }

    const isModifiedByUser = (currentValue, forbiddenValue) => {
        if (currentValue === forbiddenValue) {
            return false;
        }

        if (currentValue === undefined) {
            return false;
        }

        return true;
    };

    const valuesToUpdate = [];

    configUpdateAlert.configUpdateAlertShown = true;

    if (!isModifiedByUser(config.licenseKey, '<YOUR_LICENSE_KEY>')) {
        valuesToUpdate.push('LICENSE_KEY');
    }

    if (!isModifiedByUser(config.cloudServices?.tokenUrl, '<YOUR_CLOUD_SERVICES_TOKEN_URL>')) {
        valuesToUpdate.push('CLOUD_SERVICES_TOKEN_URL');
    }

    if (!isModifiedByUser(config.cloudServices?.webSocketUrl, '<YOUR_CLOUD_SERVICES_WEBSOCKET_URL>')) {
        valuesToUpdate.push('CLOUD_SERVICES_WEBSOCKET_URL');
    }

    if (valuesToUpdate.length) {
        window.alert(
            [
                'Please update the following values in your editor config',
                'to receive full access to Premium Features:',
                '',
                ...valuesToUpdate.map(value => ` - ${value}`)
            ].join('\n')
        );
    }
}
