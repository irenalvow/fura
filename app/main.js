$.debounce = function(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/*$.fn.onvalid = function(handler){
    $.fn.onvalid.setHandler(this);
    this.on("validdata",handler);

    return this;
};

$.fn.oninvalid = function(handler){
    $.fn.onvalid.setHandler(this);
    this.on("invaliddata",handler);

    return this;
};

$.fn.onvalid.isValid = function($, eventName){
    var valid = true;
    $.each(function(i, el){
        valid = valid && el.dispatchEvent(new Event(eventName));
    });
    return valid;
}    

$.fn.onvalid.setHandler = function(els){

    els.each(function(i, el){
        if(!(el instanceof HTMLInputElement || el instanceof HTMLFormElement)) return;
        var $Input, $Form;

        function formHnd(e){
            var valid = $Form[0].checkValidity() && $Form[0].querySelectorAll("input[w-equal-to]").length == $Form[0].querySelectorAll("input[w-equal-to][w-is-equal]").length;   
                valid = $.fn.onvalid.isValid($Form, valid ? "validdata" : "invaliddata") && valid;        
            if(!valid && e.type == "submit") e.preventDefault();  
        }

        function inputHnd(e){
            if(e.type == "invalid") return e.target.dispatchEvent(new Event("invaliddata"));
            
            var curretPos = e.target.selectionStart;
            e.target.value = e.target.value;

            curretPos = curretPos > e.target.value.length ? e.target.value.length : curretPos;
            e.target.setSelectionRange(curretPos,curretPos);
            
            var isEqual  = true;
            if(e.target.getAttribute("w-equal-to") != null)
                if(e.target.value == document.querySelector(e.target.getAttribute("w-equal-to")).value) e.target.getAttribute("w-is-equal") = "";
                else {
                    isEqual = false;
                    e.target.removeAttribute("w-is-equal");
                }
            
            e.target.dispatchEvent(new Event(e.target.checkValidity() && isEqual ? "validdata" : "invaliddata"));
        };

        if(el instanceof HTMLFormElement){
            $Form  = $(el).on("submit keyup",formHnd);            
            $Input = $(el).find("input").on("input invalid",inputHnd);
        } else if(el instanceof HTMLInputElement){
            $Input = $(el).on("input invalid",inputHnd);
            $Form  = $(el.form).on("submit keyup",formHnd);
        }
    });
};*/

$.fn.slider = function(){
	var notBinded = this.filter(':not([data-slider-binded])'),
		nbUl = notBinded.find('ul'),
		nbLi = nbUl.find('li');

	if(notBinded.length == 0) return;

	notBinded.each(function(){
		var self = this, position;

		this.dataset.sliderBinded = true;
		this.dataset.sliderStoped = false;
		position = window.getComputedStyle(this).position;

		if(position != 'fixed' && 
			position != 'absolute' &&
			position != 'relative') this.style.position = 'absolute';

		$.fn.slider.updatePagination(this);

		this.dataset.itervalId = setInterval(function(){	
			if(self.dataset.sliderStoped == 'true') return;
			$.fn.slider.updatePagination(self, 1);
			self.firstElementChild.style.left = -(self.dataset.currentPage|0) * self.offsetWidth + "px";			
		},6000);
	});

	$(window).resize(function(){
		nbLi.each(function(){
			this.style.width = this.parentElement.parentElement.offsetWidth + "px";
			this.parentElement.style.width = this.parentElement.parentElement.offsetWidth * this.parentElement.childElementCount + "px";
			this.parentElement.style.left = -(this.parentElement.parentElement.dataset.currentPage|0) * this.parentElement.parentElement.offsetWidth + "px";
		});			
	}).resize();

	return this;
};

$.fn.slider.updatePagination = function(self, offset){	
	//self.dataset.currentPage = Math.abs(self.firstElementChild.offsetLeft / self.offsetWidth);
	if(self.firstElementChild.childElementCount == 1) return;

	if(offset){
		var cp = (self.dataset.currentPage|0) + offset;

		if(cp >= 0) self.dataset.currentPage = cp % self.firstElementChild.childElementCount;
		else self.dataset.currentPage = self.firstElementChild.childElementCount - (-cp % self.firstElementChild.childElementCount);
	}
    
	self.dataset.nextPage = ( (self.dataset.currentPage|0) + 1 ) % self.firstElementChild.childElementCount;
	self.dataset.prevPage = ( (self.dataset.currentPage|0) - 1 ) == -1 ? ( self.firstElementChild.childElementCount - 1 ) : ( (self.dataset.currentPage|0) - 1 );
};

$.fn.slider.debounce = $.debounce(function(self){
	self.dataset.sliderStoped = false;
},6000);

$.fn.sliderNext = function(r){
	if(r) return this[0].dataset.nextPage|0;

	var binded = this.filter('[data-slider-binded]');

	if(binded.length == 0) return;

	binded.each(function(){
		$.fn.slider.updatePagination(this, 1);
		this.firstElementChild.style.left = -(this.dataset.currentPage|0) * this.offsetWidth + "px";	

		if(this.dataset.sliderStoped == 'false') $.fn.slider.debounce(this);
		this.dataset.sliderStoped = true;
	});

	return this;
};

$.fn.sliderPrev = function(r){
	if(r) return this[0].dataset.prevPage|0;

	var binded = this.filter('[data-slider-binded]');

	if(binded.length == 0) return;

	binded.each(function(){
		$.fn.slider.updatePagination(this, -1);
		this.firstElementChild.style.left = -(this.dataset.currentPage|0) * this.offsetWidth + "px";	

		if(this.dataset.sliderStoped == 'false') $.fn.slider.debounce(this);
		this.dataset.sliderStoped = true;
	});

	return this;
};

$.fn.sliderPage = function(page){
	if(page == undefined) return this[0].dataset.currentPage|0;

	var binded = this.filter('[data-slider-binded]');

	if(binded.length == 0) return;

	binded.each(function(){
		if(page >= 0) page = page % this.firstElementChild.childElementCount;
		else page = this.firstElementChild.childElementCount - (-page % this.firstElementChild.childElementCount);

		$.fn.slider.updatePagination(this, page - (this.dataset.currentPage|0) );
		this.firstElementChild.style.left = -(page|0) * this.offsetWidth + "px";	

		if(this.dataset.sliderStoped == 'false') $.fn.slider.debounce(this);
		this.dataset.sliderStoped = true;
	});

	return this;
};

$.fn.sliderStop = function(r){
	if(r) return this[0].dataset.sliderStoped == 'true';

	var binded = this.filter('[data-slider-binded]');

	if(binded.length == 0) return;

	binded.each(function(){
		this.dataset.sliderStoped = true;
	});

	return this;
};

$.fn.sliderStart = function(r){
	if(r) return this[0].dataset.sliderStoped != 'true';

	var binded = this.filter('[data-slider-binded]');

	if(binded.length == 0) return;

	binded.each(function(){
		this.dataset.sliderStoped = false;
	});

	return this;
};

$(function(){	
	$('[fu-slider]')
		.slider()
		.on('swiperight', function(){
			$(this).sliderPrev();
		})
		.on('swipeleft', function(){
			$(this).sliderNext();
		});

	$('[fu-slider-container]')
		.find('[fu-prev]')
			.click(function(e){
				$(this.parentElement.previousElementSibling).sliderPrev();
			}).prevObject
		.find('[fu-next]')
			.click(function(e){
				$(this.parentElement.previousElementSibling).sliderNext();
			});
	
	if('ontouchstart' in window)
		$('[for="nav-toggle"]')
			.click(function(e){
				e.preventDefault();
			})
			.on('touchend',function(e){
				$('#nav-toggle').click();
			});

	/*$("form").oninvalid(function(e){
        e.target.classList.add("invalid");
    }).onvalid(function(e){
        e.target.classList.remove("invalid");
    }).submit(function(e){
    	e.preventDefault();
        if(this.classList.contains('invalid')) return false;

        $.post("send.php", $(this).serialize(), function(d){
		    var res = JSON.parse(d);
					
			if(res.status){
				$("form input:not([type=submit])").val('');
				alert(res.text);
			} else alert(res.text); 
		});

        return false;
    });

    $("form input").oninvalid(function(e){
        e.target.classList.add("invalid");
    }).onvalid(function(e){
        e.target.classList.remove("invalid");
    });  */

    $("a[href^='#/']").click(function(e){
    	var hash = this.hash.replace("#","");
    	e.preventDefault();
    	if('ontouchstart' in window) $('#nav-toggle').prop('checked', false);
       	$('html,body').animate(
       		{ scrollTop: $(document.getElementById(hash)).offset().top }, 
       		500, 'swing',
       		function(){
       			location.hash = hash;
       		});
    });
});