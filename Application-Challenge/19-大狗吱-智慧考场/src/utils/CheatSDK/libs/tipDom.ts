
export const createTipDom = (): HTMLDivElement => {
  const tipDom = document.createElement('div');
  tipDom.className = '__ErrTipWrap__';
  tipDom.innerHTML = `
      <span class="_ErrTipSpan_ _ErrTipSpan_1_"></span><span class="_ErrTipSpan_ _ErrTipSpan_2_"></span><span class="_ErrTipSpan_ _ErrTipSpan_3_"></span><span class="_ErrTipSpan_ _ErrTipSpan_4_"></span>  
      <style>
      .__ErrTipWrap__{
        user-select: none;
      }
      ._ErrTipSpan_ {
        position: fixed;
        z-index: 999999999;
        width: 0;
        height: 0;
        animation:showMove 1s infinite linear;
      }
      ._ErrTipSpan_._ErrTipSpan_1_ {
        top: 0;
        left: 0;
        right: 0;
        height: 30px;
        width: 100%;
        background-image: linear-gradient(to bottom,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_2_ {
        top: 0;
        right: 0;
        width: 30px;
        height: 100vh;
        background-image: linear-gradient(to left,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_3_ {
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        width: 100%;
        background-image: linear-gradient(to top,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_4_ {
        top: 0;
        left: 0;
        width: 30px;
        height: 100vh;
        background-image: linear-gradient(to right,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      @keyframes showMove
      {
        0%{
          opacity: 0;
        }
        50%{
          opacity: 1;
        }
        100%{
          opacity: 0;
        }
      }
      </style>
    `;
  return tipDom
}