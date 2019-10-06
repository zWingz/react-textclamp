import * as React from 'react'
import { addResizeEventListener } from './utils'
import './style.less'

const callback = (window as any).requestIdleCallback || window.requestAnimationFrame

type ContentScope = Pick<State, 'expanded' | 'isClamped'> & Pick<TextClamp, 'toggle'>

interface Prop {
  tag?: string
  lineHeight?: number
  showExpand?: boolean
  fontSize?: number
  maxLine?: number
  contentStyle?: React.CSSProperties
  triggerStyle?: React.CSSProperties
  contentClass?: string
  triggerClass?: string
  renderTrigger?: (prop: ContentScope) => React.ReactNode | React.ReactNode
}

interface State {
  ghostHeight: number
  triggerWidth: number
  expanded: boolean
  isClamped: boolean
}
export class TextClamp extends React.Component<Prop, State> {
  static defaultProps = {
    tag: 'div',
    fontSize: 14,
    showExpand: false,
    lineHeight: 16
  }
  state: State = {
    ghostHeight: 0,
    triggerWidth: 0,
    expanded: false,
    isClamped: false
  }
  $el = React.createRef<HTMLDivElement>()
  $trigger = React.createRef<HTMLDivElement>()
  $content = React.createRef<HTMLDivElement>()
  get styles() {
    const { lineHeight, fontSize, maxLine } = this.props
    const { expanded } = this.state
    return {
      fontSize: fontSize + 'px',
      lineHeight: lineHeight + 'px',
      maxHeight: expanded ? 'none' : lineHeight * maxLine + 'px'
    }
  }
  get isSingleLine() {
    return this.props.maxLine === 1
  }
  get isShowContentMirror() {
    const { isClamped, expanded } = this.state
    return isClamped && !expanded
  }
  get containerStyles(): React.CSSProperties {
    const { showExpand, maxLine } = this.props
    const { expanded, triggerWidth } = this.state
    const ret = {
      WebkitLineClamp: expanded ? undefined : maxLine,
      maxHeight: this.styles.maxHeight
    }
    if (!showExpand) return ret
    return {
      ...ret,
      fontSize: expanded ? '0px' : triggerWidth * 1.5 + 'px',
      color: expanded ? 'inherit' : 'transparent'
    }
  }
  get contentStyles(): React.CSSProperties {
    return {
      fontSize: this.styles.fontSize,
      lineHeight: this.styles.lineHeight,
      userSelect: this.isShowContentMirror ? 'none' : 'initial',
      ...this.props.contentStyle
    }
  }
  get ghostStyles(): React.CSSProperties {
    return {
      height: this.state.ghostHeight + 'px'
    }
  }
  get placeholderStyles(): React.CSSProperties {
    return {
      height: this.state.expanded ? 'auto' : this.styles.maxHeight
    }
  }
  get triggerStyles(): React.CSSProperties {
    const { styles } = this
    return {
      fontSize: styles.fontSize,
      height: styles.lineHeight,
      marginTop: `-${styles.lineHeight}`,
      lineHeight: this.styles.lineHeight,
      ...this.props.triggerStyle
    }
  }
  get triggerMirrorStyles(): React.CSSProperties {
    return {
      marginLeft: '5px',
      float: 'none',
      marginTop: '0px',
      zIndex: 2,
      ...this.triggerStyles
    }
  }
  setClamped(val) {
    this.setState({
      isClamped: val
    })
    this.calc()
  }
  getLen() {
    const { current } = this.$content
    if (!current) return 0
    return current.getClientRects().length
  }
  update() {
    const { maxLine } = this.props
    const len = this.getLen()
    this.setClamped(len > maxLine)
  }
  async calc() {
    const { lineHeight, maxLine } = this.props
    let height
    if (this.getLen() > maxLine) {
      height = lineHeight * (maxLine + 1)
    } else {
      height = lineHeight * (maxLine - 1)
    }
    this.setState({
      ghostHeight: height
    })
    await Promise.resolve()
    const { current } = this.$trigger
    this.setState({
      triggerWidth: current ? current.offsetWidth : 0
    })
  }
  toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      expanded: !this.state.expanded
    })
  }
  componentDidMount() {
    if (!this.props.showExpand) return
    callback(() => {
      this.update()
      addResizeEventListener(this.$el.current, this.update.bind(this))
    })
  }
  renderTrigger(): React.ReactNode {
    const { toggle } = this
    const { isClamped, expanded } = this.state
    const scope: ContentScope = {
      expanded,
      isClamped,
      toggle
    }
    const { renderTrigger } = this.props
    if(renderTrigger) {
      return renderTrigger(scope)
    }
    return (!expanded ? '[...more]' : '[hide]')
  }
  render() {
    const { toggle, isSingleLine: isSingle } = this
    const { triggerClass, contentClass, tag, showExpand, children } = this.props
    const Tag = tag as any
    const { isClamped, expanded } = this.state
    if (!showExpand) {
      const className = [
        'ellipsis-container',
        isSingle ? 'single-clamp' : 'multi-clamp'
      ].join(' ')
      return (
        <div ref={this.$el} className={className} style={this.containerStyles}>
          {children}
        </div>
      )
    }
    const Trigger = this.renderTrigger()
    const triggerProps = {
      className: `ellipsis-trigger ${triggerClass || ''}`,
      onClick: toggle
    }
    const ContentMirror = this.isShowContentMirror ? (
      <span className='ellipsis-content-mirror' style={this.contentStyles}>
        {children}
      </span>
    ) : null
    const Expand = isClamped ? (
      expanded ? (
        <span
          {...triggerProps}
          style={this.triggerMirrorStyles}>
          {Trigger}
        </span>
      ) : (
        <div className='ellipsis-ghost' style={this.ghostStyles}>
          <div className='ellipsis-placeholder' style={this.placeholderStyles} />
          <span
            ref={this.$trigger}
            {...triggerProps}
            style={this.triggerStyles}>
            {Trigger}
          </span>
        </div>
      )
    ) : null
    return (
      <Tag
        ref={this.$el}
        className='ellipsis-container with-expand multi-clamp'
        style={this.containerStyles}>
        <span
          ref={this.$content}
          className={`ellipsis-content ${contentClass || ''}`}
          style={this.contentStyles}>
          {children}
        </span>
        {ContentMirror}
        {Expand}
      </Tag>
    )
  }
}
