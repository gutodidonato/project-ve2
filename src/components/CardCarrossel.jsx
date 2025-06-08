import Card from "./Card";

export default function CardCarrossel() {

  return (
    <div className="relative overflow-hidden w-full h-full flex justify-center top-10" style={{ transformStyle: 'preserve-3d' }}>
        <div className="runner absolute transform-3d w-3/5 ">
            <div className="item" style={{ '--position': 1 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 2 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 3 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 4 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 5 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 6 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 7 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 8 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 9 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
            <div className="item" style={{ '--position': 10 }}>
                <Card title="hero" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </div>
        
        </div>
    </div>
  )
}
