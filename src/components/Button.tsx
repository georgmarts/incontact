'use client'
import './button.scss'

type Props = {
    type?: 'submit' | 'button';
    width?: string,
    label: string;
    color?: string;
    fn?: () => void;
    fontSize?: string,
    loading?: boolean
}

export default function Button({type, width, label, color, fn, fontSize, loading}: Props) {

    const buttonStyle = {
        // background: color ? loading ? 'grey' : `${color}` : '#0277fc',
        background: loading ? 'grey' : color ? `${color}` : '#0277fc',
        width: `${width}`,
        fontSize: fontSize
    }
    
  return (
    <button type={type} disabled={loading ? true : false} className="custom-button" style={buttonStyle} onClick={fn}>
        {label}
    </button>
  )
}