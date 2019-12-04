import * as React from 'react'
import { addResizeEventListener } from './utils'

const optimizeCallback =
  (window as any).requestIdleCallback || window.requestAnimationFrame

type ContentScope = Pick<State, 'expanded' | 'isClamped'> &
  Pick<TextClamp, 'toggle'>

interface Prop {
  style?: React.CSSProperties
  className?: string
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
  triggerWidth?: number,
  triggerWidthPercent?: number
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
    const { showExpand, maxLine, style, triggerWidthPercent = 1.2, triggerWidth: triggerWidthProp } = this.props
    const { expanded, triggerWidth } = this.state
    const ret = {
      WebkitLineClamp: expanded ? undefined : maxLine,
      maxHeight: this.styles.maxHeight,
      ...style
    }
    if (!showExpand) return ret
    const width = triggerWidthProp || (triggerWidth * triggerWidthPercent)
    return {
      ...ret,
      fontSize: expanded ? '0px' : width+ 'px',
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
  calc() {
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
    Promise.resolve().then(() => {
      const { current } = this.$trigger
      this.setState({
        triggerWidth: current ? current.offsetWidth : 0
      })
    })
  }
  toggle = e => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      expanded: !this.state.expanded
    })
  }
  componentDidMount() {
    if (!this.props.showExpand) return
    optimizeCallback(() => {
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
    if (renderTrigger) {
      return renderTrigger(scope)
    }
    return !expanded ? '[...more]' : '[hide]'
  }
  render() {
    const { toggle, isSingleLine: isSingle } = this
    const {
      triggerClass,
      contentClass,
      tag,
      showExpand,
      children,
      className: propClassName = ''
    } = this.props
    const Tag = tag as any
    const { isClamped, expanded } = this.state
    if (!showExpand) {
      const className = [
        'text-clamp',
        isSingle ? 'single-clamp' : 'multi-clamp',
        propClassName
      ]
        .filter(Boolean)
        .join(' ')
      return (
        <div ref={this.$el} className={className} style={this.containerStyles}>
          {children}
        </div>
      )
    }
    const Trigger = this.renderTrigger()
    const triggerProps = {
      className: `clamp-trigger ${triggerClass || ''}`,
      onClick: toggle
    }
    const ContentMirror = this.isShowContentMirror ? (
      <span className='clamp-content-mirror' style={this.contentStyles}>
        {children}
      </span>
    ) : null
    const Expand = isClamped ? (
      expanded ? (
        <span {...triggerProps} style={this.triggerMirrorStyles}>
          {Trigger}
        </span>
      ) : (
        <div className='clamp-ghost' style={this.ghostStyles}>
          <div
            className='clamp-placeholder'
            style={this.placeholderStyles}
          />
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
        className={`text-clamp with-trigger multi-clamp ${propClassName}`}
        style={this.containerStyles}>
        <span
          ref={this.$content}
          className={`clamp-content ${contentClass || ''}`}
          style={this.contentStyles}>
          {children}
        </span>
        {ContentMirror}
        {Expand}
      </Tag>
    )
  }
}
