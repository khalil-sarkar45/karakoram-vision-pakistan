if (window.appAlpine && window.appAlpine.__ALPINE_APP_LOADED) {
  // Already initialized in this page context - skip re-definition to avoid duplicate identifier errors.
} else {
  window.appAlpine = window.appAlpine || {};
  window.appAlpine.catalogFilters = window.appAlpine.catalogFilters || (() => ({}));
  window.appAlpine.siteNavigation = window.appAlpine.siteNavigation || (() => ({open:null,mobileOpen:false,toggle(name){this.open=this.open===name?null:name},closeAll(){this.open=null;this.mobileOpen=false}}));
  window.appAlpine.contactModal = window.appAlpine.contactModal || (() => ({open:false,opener:null,show(){this.opener=document.activeElement;this.open=true;document.documentElement.classList.add('overflow-hidden');this.$nextTick(()=>this.$refs.closeButton?.focus())},hide(){this.open=false;document.documentElement.classList.remove('overflow-hidden');this.$nextTick(()=>this.opener?.focus?.())}}));
  window.appAlpine.galleryLightbox = window.appAlpine.galleryLightbox || ((images=[]) => ({images,active:null,open(i){this.active=i;document.documentElement.classList.add('overflow-hidden')},close(){this.active=null;document.documentElement.classList.remove('overflow-hidden')},next(){if(this.active!==null)this.active=(this.active+1)%this.images.length},prev(){if(this.active!==null)this.active=(this.active-1+this.images.length)%this.images.length}}));
  window.appAlpine.contentEnhancer = window.appAlpine.contentEnhancer || (() => ({toc:[],init(){const headings=[...this.$el.querySelectorAll('.prose-clean h2')];headings.forEach((h,i)=>{if(!h.id)h.id=`section-${i+1}`;this.toc.push({id:h.id,label:h.textContent.trim()})})}}));

  window.appAlpine.registerAlpineComponents = window.appAlpine.registerAlpineComponents || function() {
    if (!window.Alpine) return;
    Alpine.data('contactModal', window.appAlpine.contactModal);
    Alpine.data('siteNavigation', window.appAlpine.siteNavigation);
    Alpine.data('catalogFilters', window.appAlpine.catalogFilters);
    Alpine.data('galleryLightbox', window.appAlpine.galleryLightbox);
    Alpine.data('contentEnhancer', window.appAlpine.contentEnhancer);
  };

  if (window.Alpine) {
    window.appAlpine.registerAlpineComponents();
  } else {
    document.addEventListener('alpine:init', window.appAlpine.registerAlpineComponents);
  }

  // Mark as loaded to prevent duplicate execution across scripts
  window.appAlpine.__ALPINE_APP_LOADED = true;
}
