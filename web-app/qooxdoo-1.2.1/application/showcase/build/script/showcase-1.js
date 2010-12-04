qx.$$packageData['00f5d2058aee']={"locales":{},"resources":{},"translations":{}};

qx.Part.$$notifyLoad("00f5d2058aee", function() {
(function(){var l="move",k="Boolean",j="mouseup",i="mousedown",h="losecapture",g="__pU",f="qx.ui.core.MMovable",d="__pV",c="mousemove",b="maximized",a="move-frame";
qx.Mixin.define(f,{properties:{movable:{check:k,init:true},useMoveFrame:{check:k,init:false}},members:{__pU:null,__pV:null,__pW:null,__pX:null,__pY:null,__qa:null,__qb:null,__qc:false,__qd:null,__qe:0,_activateMoveHandle:function(n){if(this.__pU){throw new Error("The move handle could not be redefined!");
}this.__pU=n;
n.addListener(i,this._onMoveMouseDown,this);
n.addListener(j,this._onMoveMouseUp,this);
n.addListener(c,this._onMoveMouseMove,this);
n.addListener(h,this.__qi,this);
},__qf:function(){var t=this.__pV;

if(!t){t=this.__pV=new qx.ui.core.Widget();
t.setAppearance(a);
t.exclude();
qx.core.Init.getApplication().getRoot().add(t);
}return t;
},__qg:function(){var location=this.getContainerLocation();
var s=this.getBounds();
var r=this.__qf();
r.setUserBounds(location.left,location.top,s.width,s.height);
r.show();
r.setZIndex(this.getZIndex()+1);
},__qh:function(e){var v=this.__pW;
var y=Math.max(v.left,Math.min(v.right,e.getDocumentLeft()));
var x=Math.max(v.top,Math.min(v.bottom,e.getDocumentTop()));
var u=this.__pX+y;
var w=this.__pY+x;
return {viewportLeft:u,viewportTop:w,parentLeft:u-this.__qa,parentTop:w-this.__qb};
},_onMoveMouseDown:function(e){if(!this.getMovable()||this.hasState(b)){return;
}var parent=this.getLayoutParent();
var p=parent.getContentLocation();
var q=parent.getBounds();
if(qx.Class.implementsInterface(parent,qx.ui.window.IDesktop)){if(!parent.isContentBlocked()){this.__qc=true;
this.__qd=parent.getBlockerColor();
this.__qe=parent.getBlockerOpacity();
parent.setBlockerColor(null);
parent.setBlockerOpacity(1);
parent.blockContent(this.getZIndex()-1);
}}this.__pW={left:p.left,top:p.top,right:p.left+q.width,bottom:p.top+q.height};
var o=this.getContainerLocation();
this.__qa=p.left;
this.__qb=p.top;
this.__pX=o.left-e.getDocumentLeft();
this.__pY=o.top-e.getDocumentTop();
this.addState(l);
this.__pU.capture();
if(this.getUseMoveFrame()){this.__qg();
}e.stop();
},_onMoveMouseMove:function(e){if(!this.hasState(l)){return;
}var z=this.__qh(e);

if(this.getUseMoveFrame()){this.__qf().setDomPosition(z.viewportLeft,z.viewportTop);
}else{this.setDomPosition(z.parentLeft,z.parentTop);
}e.stopPropagation();
},_onMoveMouseUp:function(e){if(!this.hasState(l)){return;
}this.removeState(l);
var parent=this.getLayoutParent();

if(qx.Class.implementsInterface(parent,qx.ui.window.IDesktop)){if(this.__qc){parent.unblockContent();
parent.setBlockerColor(this.__qd);
parent.setBlockerOpacity(this.__qe);
this.__qd=null;
this.__qe=0;
}}this.__pU.releaseCapture();
var m=this.__qh(e);
this.setLayoutProperties({left:m.parentLeft,top:m.parentTop});
if(this.getUseMoveFrame()){this.__qf().exclude();
}e.stopPropagation();
},__qi:function(e){if(!this.hasState(l)){return;
}this.removeState(l);
if(this.getUseMoveFrame()){this.__qf().exclude();
}}},destruct:function(){this._disposeObjects(d,g);
this.__pW=null;
}});
})();
(function(){var l="Boolean",k="resize",j="mousedown",i="w-resize",h="sw-resize",g="n-resize",f="resizableRight",d="ne-resize",c="se-resize",b="Integer",A="e-resize",z="resizableLeft",y="mousemove",x="move",w="shorthand",v="maximized",u="nw-resize",t="mouseout",s="qx.ui.core.MResizable",r="mouseup",p="losecapture",q="resize-frame",n="resizableBottom",o="s-resize",m="resizableTop";
qx.Mixin.define(s,{construct:function(){this.addListener(j,this.__pP,this,true);
this.addListener(r,this.__pQ,this);
this.addListener(y,this.__pS,this);
this.addListener(t,this.__pT,this);
this.addListener(p,this.__pR,this);
var U=this.getContainerElement().getDomElement();

if(U==null){U=window;
}this.__pD=qx.event.Registration.getManager(U).getHandler(qx.event.handler.DragDrop);
},properties:{resizableTop:{check:l,init:true},resizableRight:{check:l,init:true},resizableBottom:{check:l,init:true},resizableLeft:{check:l,init:true},resizable:{group:[m,f,n,z],mode:w},resizeSensitivity:{check:b,init:5},useResizeFrame:{check:l,init:true}},members:{__pD:null,__pE:null,__pF:null,__pG:null,__pH:null,__pI:null,__pJ:null,RESIZE_TOP:1,RESIZE_BOTTOM:2,RESIZE_LEFT:4,RESIZE_RIGHT:8,__pK:function(){var a=this.__pE;

if(!a){a=this.__pE=new qx.ui.core.Widget();
a.setAppearance(q);
a.exclude();
qx.core.Init.getApplication().getRoot().add(a);
}return a;
},__pL:function(){var O=this.__pI;
var N=this.__pK();
N.setUserBounds(O.left,O.top,O.width,O.height);
N.show();
N.setZIndex(this.getZIndex()+1);
},__pM:function(e){var F=this.__pF;
var G=this.getSizeHint();
var J=this.__pJ;
var I=this.__pI;
var E=I.width;
var H=I.height;
var L=I.left;
var top=I.top;
var K;

if((F&this.RESIZE_TOP)||(F&this.RESIZE_BOTTOM)){K=Math.max(J.top,Math.min(J.bottom,e.getDocumentTop()))-this.__pH;

if(F&this.RESIZE_TOP){H-=K;
}else{H+=K;
}
if(H<G.minHeight){H=G.minHeight;
}else if(H>G.maxHeight){H=G.maxHeight;
}
if(F&this.RESIZE_TOP){top+=I.height-H;
}}
if((F&this.RESIZE_LEFT)||(F&this.RESIZE_RIGHT)){K=Math.max(J.left,Math.min(J.right,e.getDocumentLeft()))-this.__pG;

if(F&this.RESIZE_LEFT){E-=K;
}else{E+=K;
}
if(E<G.minWidth){E=G.minWidth;
}else if(E>G.maxWidth){E=G.maxWidth;
}
if(F&this.RESIZE_LEFT){L+=I.width-E;
}}return {viewportLeft:L,viewportTop:top,parentLeft:I.bounds.left+L-I.left,parentTop:I.bounds.top+top-I.top,width:E,height:H};
},__pN:{1:g,2:o,4:i,8:A,5:u,6:h,9:d,10:c},__pO:function(e){var X=this.getContentLocation();
var V=this.getResizeSensitivity();
var ba=e.getDocumentLeft();
var Y=e.getDocumentTop();
var W=0;

if(this.getResizableTop()&&Math.abs(X.top-Y)<V){W+=this.RESIZE_TOP;
}else if(this.getResizableBottom()&&Math.abs(X.bottom-Y)<V){W+=this.RESIZE_BOTTOM;
}
if(this.getResizableLeft()&&Math.abs(X.left-ba)<V){W+=this.RESIZE_LEFT;
}else if(this.getResizableRight()&&Math.abs(X.right-ba)<V){W+=this.RESIZE_RIGHT;
}this.__pF=W;
},__pP:function(e){if(!this.__pF){return;
}this.addState(k);
this.__pG=e.getDocumentLeft();
this.__pH=e.getDocumentTop();
var location=this.getContainerLocation();
var D=this.getBounds();
this.__pI={top:location.top,left:location.left,width:D.width,height:D.height,bounds:qx.lang.Object.clone(D)};
var parent=this.getLayoutParent();
var B=parent.getContentLocation();
var C=parent.getBounds();
this.__pJ={left:B.left,top:B.top,right:B.left+C.width,bottom:B.top+C.height};
if(this.getUseResizeFrame()){this.__pL();
}this.capture();
e.stop();
},__pQ:function(e){if(!this.hasState(k)){return;
}if(this.getUseResizeFrame()){this.__pK().exclude();
}var M=this.__pM(e);
this.setWidth(M.width);
this.setHeight(M.height);
if(this.getResizableLeft()||this.getResizableTop()){this.setLayoutProperties({left:M.parentLeft,top:M.parentTop});
}this.__pF=0;
this.removeState(k);
this.resetCursor();
this.getApplicationRoot().resetGlobalCursor();
this.releaseCapture();
e.stopPropagation();
},__pR:function(e){if(!this.__pF){return;
}this.resetCursor();
this.getApplicationRoot().resetGlobalCursor();
this.removeState(x);
if(this.getUseResizeFrame()){this.__pK().exclude();
}},__pS:function(e){if(this.hasState(k)){var S=this.__pM(e);
if(this.getUseResizeFrame()){var Q=this.__pK();
Q.setUserBounds(S.viewportLeft,S.viewportTop,S.width,S.height);
}else{this.setWidth(S.width);
this.setHeight(S.height);
if(this.getResizableLeft()||this.getResizableTop()){this.setLayoutProperties({left:S.parentLeft,top:S.parentTop});
}}e.stopPropagation();
}else if(!this.hasState(v)&&!this.__pD.isSessionActive()){this.__pO(e);
var T=this.__pF;
var R=this.getApplicationRoot();

if(T){var P=this.__pN[T];
this.setCursor(P);
R.setGlobalCursor(P);
}else if(this.getCursor()){this.resetCursor();
R.resetGlobalCursor();
}}},__pT:function(e){if(this.getCursor()&&!this.hasState(k)){this.resetCursor();
this.getApplicationRoot().resetGlobalCursor();
}}},destruct:function(){if(this.__pE!=null&&!qx.core.ObjectRegistry.inShutDown){this.__pE.destroy();
this.__pE=null;
}this.__pD=null;
}});
})();
(function(){var a="qx.ui.window.IWindowManager";
qx.Interface.define(a,{members:{setDesktop:function(b){this.assertInterface(b,qx.ui.window.IDesktop);
},changeActiveWindow:function(d,e){},updateStack:function(){},bringToFront:function(c){this.assertInstance(c,qx.ui.window.Window);
},sendToBack:function(f){this.assertInstance(f,qx.ui.window.Window);
}}});
})();
(function(){var b="__qj",a="qx.ui.window.Manager";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.ui.window.IWindowManager,members:{__qj:null,setDesktop:function(c){this.__qj=c;
this.updateStack();
},getDesktop:function(){return this.__qj;
},changeActiveWindow:function(k,m){if(k){this.updateStack();
this.bringToFront(k);
k.setActive(true);
}
if(m){m.resetActive();
}},_minZIndex:1e5,updateStack:function(){qx.ui.core.queue.Widget.add(this);
},syncWidget:function(){this.__qj.forceUnblockContent();
var n=this.__qj.getWindows();
var p=this._minZIndex;
var s=p+n.length*2;
var q=p+n.length*4;
var r=null;

for(var i=0,l=n.length;i<l;i++){var o=n[i];
if(!o.isVisible()){continue;
}if(r==null){r=o;
}if(o.isModal()){o.setZIndex(q);
this.__qj.blockContent(q-1);
q+=2;
}else if(o.isAlwaysOnTop()){o.setZIndex(s);
s+=2;
}else{o.setZIndex(p);
p+=2;
}if(o.isActive()){r=o;
}else{if(!r.isActive()){if(o.getZIndex()>r.getZIndex()){r=o;
}}}}
if(r){this.__qj.setActiveWindow(r);
}},bringToFront:function(d){var e=this.__qj.getWindows();
var f=qx.lang.Array.remove(e,d);

if(f){e.push(d);
this.updateStack();
}},sendToBack:function(g){var h=this.__qj.getWindows();
var j=qx.lang.Array.remove(h,g);

if(j){h.unshift(g);
this.updateStack();
}}},destruct:function(){this._disposeObjects(b);
}});
})();
(function(){var B="Boolean",A="qx.event.type.Event",z="captionbar",y="_applyCaptionBarChange",x="maximize-button",w="restore-button",v="minimize-button",u="close-button",t="maximized",s="execute",bi="pane",bh="title",bg="icon",bf="statusbar-text",be="statusbar",bd="String",bc="normal",bb="active",ba="beforeClose",Y="beforeMinimize",I="mousedown",J="changeStatus",G="changeIcon",H="excluded",E="dblclick",F="_applyActive",C="beforeRestore",D="minimize",K="changeModal",L="changeAlwaysOnTop",Q="_applyShowStatusbar",P="_applyStatus",S="qx.ui.window.Window",R="changeCaption",U="focusout",T="beforeMaximize",N="maximize",X="restore",W="window",V="close",M="changeActive",O="minimized";
qx.Class.define(S,{extend:qx.ui.core.Widget,include:[qx.ui.core.MRemoteChildrenHandling,qx.ui.core.MRemoteLayoutHandling,qx.ui.core.MResizable,qx.ui.core.MMovable,qx.ui.core.MContentPadding],construct:function(c,d){qx.ui.core.Widget.call(this);
this._setLayout(new qx.ui.layout.VBox());
this._createChildControl(z);
this._createChildControl(bi);
if(d!=null){this.setIcon(d);
}
if(c!=null){this.setCaption(c);
}this._updateCaptionBar();
this.addListener(I,this._onWindowMouseDown,this,true);
this.addListener(U,this._onWindowFocusOut,this);
qx.core.Init.getApplication().getRoot().add(this);
this.initVisibility();
qx.ui.core.FocusHandler.getInstance().addRoot(this);
},statics:{DEFAULT_MANAGER_CLASS:qx.ui.window.Manager},events:{"beforeClose":A,"close":A,"beforeMinimize":A,"minimize":A,"beforeMaximize":A,"maximize":A,"beforeRestore":A,"restore":A},properties:{appearance:{refine:true,init:W},visibility:{refine:true,init:H},focusable:{refine:true,init:true},active:{check:B,init:false,apply:F,event:M},alwaysOnTop:{check:B,init:false,event:L},modal:{check:B,init:false,event:K},caption:{apply:y,event:R,nullable:true},icon:{check:bd,nullable:true,apply:y,event:G,themeable:true},status:{check:bd,nullable:true,apply:P,event:J},showClose:{check:B,init:true,apply:y,themeable:true},showMaximize:{check:B,init:true,apply:y,themeable:true},showMinimize:{check:B,init:true,apply:y,themeable:true},allowClose:{check:B,init:true,apply:y},allowMaximize:{check:B,init:true,apply:y},allowMinimize:{check:B,init:true,apply:y},showStatusbar:{check:B,init:false,apply:Q}},members:{__qk:null,__ql:null,getChildrenContainer:function(){return this.getChildControl(bi);
},_forwardStates:{active:true,maximized:true},setLayoutParent:function(parent){{};
qx.ui.core.Widget.prototype.setLayoutParent.call(this,parent);
},_createChildControlImpl:function(bm){var bn;

switch(bm){case be:bn=new qx.ui.container.Composite(new qx.ui.layout.HBox());
this._add(bn);
bn.add(this.getChildControl(bf));
break;
case bf:bn=new qx.ui.basic.Label();
bn.setValue(this.getStatus());
break;
case bi:bn=new qx.ui.container.Composite();
this._add(bn,{flex:1});
break;
case z:var bp=new qx.ui.layout.Grid();
bp.setRowFlex(0,1);
bp.setColumnFlex(1,1);
bn=new qx.ui.container.Composite(bp);
this._add(bn);
bn.addListener(E,this._onCaptionMouseDblClick,this);
this._activateMoveHandle(bn);
break;
case bg:bn=new qx.ui.basic.Image(this.getIcon());
this.getChildControl(z).add(bn,{row:0,column:0});
break;
case bh:bn=new qx.ui.basic.Label(this.getCaption());
bn.setWidth(0);
bn.setAllowGrowX(true);
var bo=this.getChildControl(z);
bo.add(bn,{row:0,column:1});
break;
case v:bn=new qx.ui.form.Button();
bn.setFocusable(false);
bn.addListener(s,this._onMinimizeButtonClick,this);
this.getChildControl(z).add(bn,{row:0,column:2});
break;
case w:bn=new qx.ui.form.Button();
bn.setFocusable(false);
bn.addListener(s,this._onRestoreButtonClick,this);
this.getChildControl(z).add(bn,{row:0,column:3});
break;
case x:bn=new qx.ui.form.Button();
bn.setFocusable(false);
bn.addListener(s,this._onMaximizeButtonClick,this);
this.getChildControl(z).add(bn,{row:0,column:4});
break;
case u:bn=new qx.ui.form.Button();
bn.setFocusable(false);
bn.addListener(s,this._onCloseButtonClick,this);
this.getChildControl(z).add(bn,{row:0,column:6});
break;
}return bn||qx.ui.core.Widget.prototype._createChildControlImpl.call(this,bm);
},_updateCaptionBar:function(){var g;
var h=this.getIcon();

if(h){this.getChildControl(bg).setSource(h);
this._showChildControl(bg);
}else{this._excludeChildControl(bg);
}var f=this.getCaption();

if(f){this.getChildControl(bh).setValue(f);
this._showChildControl(bh);
}else{this._excludeChildControl(bh);
}
if(this.getShowMinimize()){this._showChildControl(v);
g=this.getChildControl(v);
this.getAllowMinimize()?g.resetEnabled():g.setEnabled(false);
}else{this._excludeChildControl(v);
}
if(this.getShowMaximize()){if(this.isMaximized()){this._showChildControl(w);
this._excludeChildControl(x);
}else{this._showChildControl(x);
this._excludeChildControl(w);
}g=this.getChildControl(x);
this.getAllowMaximize()?g.resetEnabled():g.setEnabled(false);
}else{this._excludeChildControl(x);
this._excludeChildControl(w);
}
if(this.getShowClose()){this._showChildControl(u);
g=this.getChildControl(u);
this.getAllowClose()?g.resetEnabled():g.setEnabled(false);
}else{this._excludeChildControl(u);
}},close:function(){if(!this.isVisible()){return;
}
if(this.fireNonBubblingEvent(ba,qx.event.type.Event,[false,true])){this.hide();
this.fireEvent(V);
}},open:function(){this.show();
this.setActive(true);
this.focus();
},center:function(){var parent=this.getLayoutParent();

if(parent){var bk=parent.getBounds();

if(bk){var bl=this.getSizeHint();
var bj=Math.round((bk.width-bl.width)/2);
var top=Math.round((bk.height-bl.height)/2);

if(top<0){top=0;
}this.moveTo(bj,top);
return;
}}{};
},maximize:function(){if(this.isMaximized()){return;
}var parent=this.getLayoutParent();

if(parent!=null&&parent.supportsMaximize()){if(this.fireNonBubblingEvent(T,qx.event.type.Event,[false,true])){if(!this.isVisible()){this.open();
}var n=this.getLayoutProperties();
this.__ql=n.left===undefined?0:n.left;
this.__qk=n.top===undefined?0:n.top;
this.setLayoutProperties({left:null,top:null,edge:0});
this.addState(t);
this._updateCaptionBar();
this.fireEvent(N);
}}},minimize:function(){if(!this.isVisible()){return;
}
if(this.fireNonBubblingEvent(Y,qx.event.type.Event,[false,true])){var bq=this.getLayoutProperties();
this.__ql=bq.left===undefined?0:bq.left;
this.__qk=bq.top===undefined?0:bq.top;
this.removeState(t);
this.hide();
this.fireEvent(D);
}},restore:function(){if(this.getMode()===bc){return;
}
if(this.fireNonBubblingEvent(C,qx.event.type.Event,[false,true])){if(!this.isVisible()){this.open();
}var r=this.__ql;
var top=this.__qk;
this.setLayoutProperties({edge:null,left:r,top:top});
this.removeState(t);
this._updateCaptionBar();
this.fireEvent(X);
}},moveTo:function(q,top){if(this.isMaximized()){return;
}this.setLayoutProperties({left:q,top:top});
},isMaximized:function(){return this.hasState(t);
},getMode:function(){if(!this.isVisible()){return O;
}else{if(this.isMaximized()){return t;
}else{return bc;
}}},_applyActive:function(i,j){if(j){this.removeState(bb);
}else{this.addState(bb);
}},_getContentPaddingTarget:function(){return this.getChildControl(bi);
},_applyShowStatusbar:function(o,p){if(o){this._showChildControl(be);
}else{this._excludeChildControl(be);
}},_applyCaptionBarChange:function(a,b){this._updateCaptionBar();
},_applyStatus:function(k,l){var m=this.getChildControl(bf,true);

if(m){m.setValue(k);
}},_onWindowEventStop:function(e){e.stopPropagation();
},_onWindowMouseDown:function(e){this.setActive(true);
},_onWindowFocusOut:function(e){if(this.getModal()){return;
}var br=e.getRelatedTarget();

if(br!=null&&!qx.ui.core.Widget.contains(this,br)){this.setActive(false);
}},_onCaptionMouseDblClick:function(e){if(this.getAllowMaximize()){this.isMaximized()?this.restore():this.maximize();
}},_onMinimizeButtonClick:function(e){this.minimize();
this.getChildControl(v).reset();
},_onRestoreButtonClick:function(e){this.restore();
this.getChildControl(w).reset();
},_onMaximizeButtonClick:function(e){this.maximize();
this.getChildControl(x).reset();
},_onCloseButtonClick:function(e){this.close();
this.getChildControl(u).reset();
}}});
})();
(function(){var a="qx.ui.window.IDesktop";
qx.Interface.define(a,{members:{setWindowManager:function(c){this.assertInterface(c,qx.ui.window.IWindowManager);
},getWindows:function(){},supportsMaximize:function(){},blockContent:function(b){this.assertInteger(b);
},unblockContent:function(){},isContentBlocked:function(){}}});
})();
(function(){var a="qx.ui.window.Desktop";
qx.Class.define(a,{extend:qx.ui.core.Widget,include:[qx.ui.core.MChildrenHandling,qx.ui.window.MDesktop,qx.ui.core.MBlocker],implement:qx.ui.window.IDesktop,construct:function(b){qx.ui.core.Widget.call(this);
this.getContentElement().disableScrolling();
this._setLayout(new qx.ui.layout.Canvas());
this.setWindowManager(b);
}});
})();
(function(){var a="showcase.page.AbstractDesktopContent";
qx.Class.define(a,{extend:showcase.AbstractContent,construct:function(d){showcase.AbstractContent.call(this,d);
this.setView(this._createView());
},members:{_createView:function(){var c=new qx.ui.window.Desktop(new qx.ui.window.Manager());
var b=new qx.ui.window.Window();
b.set({showClose:false,showMinimize:false,contentPadding:0});
this._addWindowContent(b);
c.add(b);
b.moveTo(30,20);
b.open();
return c;
},_addWindowContent:function(e){throw new Error("Abstract method call!");
}}});
})();
(function(){var h="checked",g="menu-checkbox",f="Boolean",d="_applyValue",c="changeValue",b="qx.ui.menu.CheckBox",a="execute";
qx.Class.define(b,{extend:qx.ui.menu.AbstractButton,implement:[qx.ui.form.IBooleanForm],construct:function(i,j){qx.ui.menu.AbstractButton.call(this);
if(i!=null){if(i.translate){this.setLabel(i.translate());
}else{this.setLabel(i);
}}
if(j!=null){this.setMenu(j);
}this.addListener(a,this._onExecute,this);
},properties:{appearance:{refine:true,init:g},value:{check:f,init:false,apply:d,event:c,nullable:true}},members:{_applyValue:function(k,l){k?this.addState(h):this.removeState(h);
},_onExecute:function(e){this.toggleValue();
},_onMouseUp:function(e){if(e.isLeftPressed()){this.execute();
}qx.ui.menu.Manager.getInstance().hideAll();
},_onKeyPress:function(e){this.execute();
}}});
})();

});