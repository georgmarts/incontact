'use client'
import './button.scss'

type Props = {
    type?: 'submit' | 'button';
    width?: string,
    label: string;
    color?: string;
    fn?: () => void;
    fontSize?: string
}

export default function Button({type, width, label, color, fn, fontSize}: Props) {

    const buttonStyle = {
        background: color ? `${color}` : '#0277fc',
        width: `${width}`,
        fontSize: fontSize
    }

  return (
    <button type={type} className="custom-button" style={buttonStyle} onClick={fn}>
        {label}
    </button>
  )
}