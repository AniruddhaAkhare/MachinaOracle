import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MachinaOracle — Industrial AI Monitoring",
  description: "Smart Manufacturing Plant Intelligence Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans+Condensed:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <canvas id="particles-canvas" aria-hidden="true" />
        <div className="z-app min-h-screen">{children}</div>
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var c=document.getElementById('particles-canvas');
  if(!c)return;
  var x=c.getContext('2d');
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize);
  var pts=[];
  for(var i=0;i<60;i++){
    pts.push({x:Math.random()*c.width,y:Math.random()*c.height,
      vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,
      r:Math.random()*.9+.2,o:Math.random()*.28+.06,
      blue:Math.random()>.55});
  }
  function draw(){
    x.clearRect(0,0,c.width,c.height);
    pts.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;
      if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
      x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);
      x.fillStyle=p.blue?'rgba(59,130,246,'+p.o+')':'rgba(203,213,225,'+(p.o*.45)+')';
      x.fill();
    });
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<140){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);
          x.strokeStyle='rgba(59,130,246,'+(0.04*(1-d/140))+')';x.lineWidth=.5;x.stroke();}
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
        `}} />
      </body>
    </html>
  );
}
