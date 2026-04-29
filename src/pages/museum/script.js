const SLIDE_WIDTH=200;
const SLIDE_HEIGHT=275;
const SLIDE_GAP=100;
const SLIDE_COUNT=9;
const ARC_DEPTH=200;
const CENTER_LIFT=100;
const SCROLL_LERP=0.05;

const slideSources = Array.from(
  {length:9},
  (_,i)=>`https://picsum.photos/200/300?random=${i}`
);

const slideTitles=[
    "案例博物馆1",
    "案例博物馆2",
    "案例博物馆3",
    "案例博物馆4",
    "案例博物馆5",
    "案例博物馆6",
    "案例博物馆7",
    "案例博物馆8",
    "案例博物馆9",
];

const slideContainer=document.querySelector(".slider");
const titleDisplay=document.getElementById("slide-title");

const trackWidth=SLIDE_COUNT*SLIDE_GAP;
let windowWidth=window.innerWidth;
let windowHeight=window.innerHeight;
let windowCenterX=windowWidth/2;
let arcBaselineY=windowHeight*0.4;

slideSources.forEach((src)=>{
    const slideEl=document.createElement("div");
    slideEl.classList.add("slide");

    const imgEl=document.createElement("img");
    imgEl.src=src;
    slideEl.appendChild(imgEl);

    slideContainer.appendChild(slideEl);
});

const slideElements=gsap.utils.toArray(".slide");

function computeSlideTransform(slideIndex,scrollOffset){
    let wrappedOffsetX=
    (((slideIndex*SLIDE_GAP-scrollOffset)%trackWidth)+trackWidth)%trackWidth;
    if(wrappedOffsetX>trackWidth/2)wrappedOffsetX-=trackWidth;

    const slideCenterX=windowCenterX+wrappedOffsetX;
    const normalizedDist=(slideCenterX-windowCenterX)/(windowWidth*0.5);
    const absDist=Math.min(Math.abs(normalizedDist),1.3);

    const scaleFactor=Math.max(1-absDist*0.8,0.25);
    const scaleWidth=SLIDE_WIDTH*scaleFactor;
    const scaleHeight=SLIDE_HEIGHT*scaleFactor;

    const centerLiftY=Math.max(1-absDist*2.0,0)*CENTER_LIFT;

    return {
        x:slideCenterX-scaleWidth/2,
        y:arcBaselineY-scaleHeight/2-centerLiftY,
        width:scaleWidth,
        height:scaleHeight,
        zIndex:Math.round(1-absDist*100),
        distanceFromCenter:Math.abs(wrappedOffsetX),
    };
}

function layoutSlides(scrollOffset){
    slideElements.forEach((slideEl,i)=>{
        const {x,y,width,height,zIndex}=computeSlideTransform(
            i,
            scrollOffset,
        );
        gsap.set(slideEl,{
            x,
            y,
            width,
            height,
            zIndex,
        });
    });
}

layoutSlides(0);

let scrollTarget=0;
let scrollCurrent=0;

slideContainer.addEventListener("wheel",(e)=>{
    e.preventDefault();
    scrollTarget+=e.deltaY*0.5;
},
{passive:false},
);

let touchStartX=0;

slideContainer.addEventListener("touchstart",(e)=>{
    touchStartX=e.touches[0].clientX;
});

slideContainer.addEventListener("touchmove",(e)=>{
    e.preventDefault();
    const  touchCurrentX=e.touches[0].clientX;
    scrollTarget+=(touchStartX-touchCurrentX)*1.2;
    touchStartX=touchCurrentX;
},
{passive:false},
);

let activeSlideIndex=-1;

function syncActiveTitle(scrollOffset){
    let closestIndex=0;
    let closestDist=Infinity;

    slideElements.forEach((_,i)=>{
        const {distanceFromCenter}=computeSlideTransform(i,scrollOffset);
        if(distanceFromCenter<closestDist){
            closestDist=distanceFromCenter;
            closestIndex=i;
        }
    });
    
    if(closestIndex!==activeSlideIndex){
        activeSlideIndex=closestIndex;
        titleDisplay.textContent=slideTitles[closestIndex];
    }
}

function animate(){
    scrollCurrent+=(scrollTarget-scrollCurrent)*SCROLL_LERP;

    layoutSlides(scrollCurrent);
    syncActiveTitle(scrollCurrent);

    requestAnimationFrame(animate);
}

animate();

