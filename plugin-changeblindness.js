var jsPsychChangeBlindness = (function (jspsych) {
  'use strict';

	const info = {
	    name: "changeblindness",
	    parameters: {
			/** The image WITH the object/target shown */
			stimulus1: {
				type: jspsych.ParameterType.IMAGE,
				pretty_name: "Stimulus",
				default: undefined,
			},
			/** The image WITHOUT the object/target shown */
			stimulus2: {
				type: jspsych.ParameterType.IMAGE,
				pretty_name: "Stimulus2",
				default: undefined,
			},
			/** Set the image height in pixels */
			stimulus_height: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Image height",
				default: null,
			},
			/** Set the image width in pixels */
			stimulus_width: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Image width",
				default: null,
			},
			/** The mask to be displayed */
			mask: {
				type: jspsych.ParameterType.IMAGE,
				pretty_name: "Mask",
				default: undefined,
			},
			/** Maintain the aspect ratio after setting width or height */
			maintain_aspect_ratio: {
				type: jspsych.ParameterType.BOOL,
				pretty_name: "Maintain aspect ratio",
				default: true,
			},
			/** The duration for each image to be displayed */
			presentation_duration: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Presentation duration",
				default: 600,
			},
			/** The duration for the mask to be displayed */
			mask_duration: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Mask duration",
				default: 100,
			},
			/** The duration for each trial before it ends (i.e. timed out) */
			trial_duration: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Trial duration",
				default: 30000,
			},
			/** The margins for the location of the target [Left, Right, Top, Bottom] */
			margins: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Margins",
				array: true,
				default: undefined,
			},
			/** The type of presentation. Choose from: flicker or fade. */
			mode: {
				type: jspsych.ParameterType.STR,
				pretty_name: "Mode",
				array: false,
				default: 'flicker',
			},
			/** Whether or not to randomise the stimuli presentation (i.e. appearance/disappearance) */
			randomise_presentation_order: {
				type: jspsych.ParameterType.BOOL,
				pretty_name: "Randomise presentation order",
				array: false,
				default: false,
			},
			/** Whether to show a dot of the click location at the end of each presentation */
			show_click_location: {
				type: jspsych.ParameterType.BOOL,
				pretty_name: "Show click location",
				array: false,
				default: true,
			},
			show_click_size: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Size of the dot for the click location",
				array: false,
				default: 10,
			},
			show_click_colour: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Colour of the dot for the click location",
				array: false,
				default: 'blue',
			},
			/** Whether to show the location of the target at the end of each presentation (based on the margins provided) */
			show_target_location: {
				type: jspsych.ParameterType.BOOL,
				pretty_name: "Show target location",
				array: false,
				default: false,
			},
			target_location_colour: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Target location colour",
				array: false,
				default: 'yellow',
			},
			/** The duration of dot click location and location of target at the end of each presentation */
			location_duration: {
				type: jspsych.ParameterType.INT,
				pretty_name: "Location duration",
				array: false,
				default: 1000,
			},
	    },
	 };


	//BEGINNING OF TRIAL 
	class ChangeBlindnessPlugin {
		constructor(jsPsych) {
			this.jsPsych = jsPsych;
		}
		trial(display_element, trial) {
			//** Set the variables for the trial */
			var html = '';
			var height, width, img, id, x, y, image_shown, reactionTime;
			var xStart = trial.margins[0];
			var xEnd = trial.margins[1];
			var yStart = trial.margins[2];
			var yEnd = trial.margins[3];
			var activeTrial = true;
			var correct = false;
			var timeout = false;

			//** Randomise whether stimulus1 is presented first or not depending on specifications */
			if (trial.randomise_presentation_order) {
				var temp = Math.round(Math.random());
				if (temp == 0) {
				  var Stimulus1 = trial.stimulus1;
				  var Stimulus2 = trial.stimulus2;
				}
				else if (temp == 1) {
				  var Stimulus1 = trial.stimulus2;
				  var Stimulus2 = trial.stimulus1;
				}
			}
			else {
				var Stimulus1 = trial.stimulus2;
				var Stimulus2 = trial.stimulus1;
			}
			if (trial.mode == 'fade') {
				var Stimulustemp = Stimulus1;
				Stimulus1 = Stimulus2;
				Stimulus2 = Stimulustemp;
			}

			const setTimer = (name, duration) => {
				this.jsPsych.pluginAPI.setTimeout(name, duration);
			}

			const clearTimers = () => {
				this.jsPsych.pluginAPI.clearAllTimeouts();
			}

			// function to end trial when it is time
			const end_trial = () => {
				// kill any remaining setTimeout handlers
				clearTimers();
				// gather the data to store for the trial
				var trial_data = {
					rt: reactionTime,
					correct: correct,
					timeout: timeout,
					x: x,
					y: y,
					stimulus1: trial.stimulus1,
					stimulus2: trial.stimulus2,
					mode: trial.mode
				};
				// clear the display
				display_element.innerHTML = "";
				// move on to the next trial
				this.jsPsych.finishTrial(trial_data);
			};
			
			// function to handle clicking of the image to check for click coordinates to provided margins
			function image_Click(event) {
				if (activeTrial) {
					activeTrial = false;
					var end_time = performance.now();
					reactionTime = Math.round(end_time - start_time);
					x = event.pageX - this.offsetLeft;
					y = event.pageY - this.offsetTop;
					var cw=this.clientWidth
					var ch=this.clientHeight
					var iw=this.naturalWidth
					var ih=this.naturalHeight
					var px=x/cw*iw
					var py=y/ch*ih
					if (px >= xStart && px <= xEnd && py >= yStart && py <= yEnd) correct = true;
					clearTimers();
					if (trial.mode == 'fade') { clearInterval(id);
						img.src = trial.stimulus1
					}
					//** This is to flash the mask up one time so the image with the target present doesn't capture attention due to the movement of the change */
					else {
						img.src = trial.mask;
						setTimeout(function() { img.src = trial.stimulus1 }, trial.mask_duration);
					}
					img.style.opacity = 1;
					//** Display dot on the click location if specified */
					if (trial.show_click_location) {
						$("#imageholder").append(
							$('<div class="marker" style="border-radius: 25px;"></div>').css({
							position: 'absolute',
							top: event.pageY - trial.show_click_size/2 + 'px',
							left: event.pageX - trial.show_click_size/2 + 'px',
							width: trial.show_click_size + 'px',
							height: trial.show_click_size + 'px',
							background: trial.show_click_colour,
							zIndex: 1
							})
						);
					}
					//** Display square around the target location if specified */
					if (trial.show_target_location) {
						$("#imageholder").append(
							$('<div class="square"></div>').css({
							position: 'absolute',
							top: (yStart * ch/ih) + this.offsetTop + 'px',
							left: (xStart * cw/iw) + this.offsetLeft + 'px',
							height: (yEnd - yStart) * ch/ih - 5 + 'px',
							width: (xEnd - xStart) * cw/iw - 5 + 'px',
							border: '5px solid ' + trial.target_location_colour,
							zIndex: 1
							})
						);
					}
					if (trial.show_click_location || trial.show_target_location) setTimer(end_trial, trial.location_duration);
					else end_trial();
				}
			}

			html += '<div id="imageholder"><div id="horizontal"></div><div id="vertical"></div>'
			if (trial.mode == 'flicker') html += '<img src="' + Stimulus1 + '" id="jspsych-changeblindness-stimulus", class="flicker">';
			else if (trial.mode == 'fade') {
				html += '<img src="' + Stimulus1 + '" id="jspsych-changeblindness-stimulus" class="fade"/>'
				html += '<img src="' + Stimulus2 + '" id="jspsych-changeblindness-stimulus2" class="fade"/>';
			}
			html += '</div>'
			// update the page content
			display_element.innerHTML = html;
			// set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
			img = display_element.querySelector("#jspsych-changeblindness-stimulus");
			if (trial.stimulus_height !== null) {
				height = trial.stimulus_height;
				if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
					width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
				}
			}
			else {
				height = img.naturalHeight;
			}
			if (trial.stimulus_width !== null) {
				width = trial.stimulus_width;
				if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
					height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
				}
			}
			else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
				// if stimulus width is null, only use the image's natural width if the width value wasn't set
				// in the if statement above, based on a specified height and maintain_aspect_ratio = true
				width = img.naturalWidth;
			}
			img.style.height = height.toString() + "px";
			img.style.width = width.toString() + "px";
			img.onclick = image_Click;
			if (trial.mode == 'fade') {
				img = display_element.querySelector("#jspsych-changeblindness-stimulus2");
				if (trial.stimulus_height !== null) {
					height = trial.stimulus_height;
					if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
						width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
					}
				}
				else {
					height = img.naturalHeight;
				}
				if (trial.stimulus_width !== null) {
					width = trial.stimulus_width;
					if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
						height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
					}
				}
				else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
					// if stimulus width is null, only use the image's natural width if the width value wasn't set
					// in the if statement above, based on a specified height and maintain_aspect_ratio = true
					width = img.naturalWidth;
				}
				img.style.height = height.toString() + "px";
				img.style.width = width.toString() + "px";
				img.onclick = image_Click;
			}
			// start timing
			var start_time = performance.now();
			// Start timer for presentation timeout
			this.jsPsych.pluginAPI.setTimeout(timeout_trial, trial.trial_duration);

			// Function to display the mask
			const displayMask = () => {
				img.src = trial.mask;
				// Start timer to display the next image
				this.jsPsych.pluginAPI.setTimeout(changeImage, trial.mask_duration);
			}

			// Function to change the image and display it
			const changeImage = () => {
				// Alternate image from stimulus 1 to stimulus 2 or vice versa
				if (image_shown == 1) {
					img.src = Stimulus2;
					image_shown = 2;
				}
				else { img.src = Stimulus1;
					image_shown = 1;
				}
				// Set time to display mask
				this.jsPsych.pluginAPI.setTimeout(displayMask, trial.presentation_duration);
			}

			if (trial.mode == 'flicker') {
				// Start timer to display the mask
				this.jsPsych.pluginAPI.setTimeout(displayMask, trial.presentation_duration);
				image_shown = 1;
			}
			else if (trial.mode == 'fade') beginFade();

			// Function to begin image fading
			function beginFade() {
				var images = document.getElementsByClassName("fade");
				for (var i = 0; i < images.length; ++i) {
					images[i].style.opacity = 1;
				}
	
				var top = 1;
	
				var cur = images.length - 1;	
				changeImage();
	
				async function changeImage() {
	
					var nextImage = (1 + cur) % images.length;
	
					images[cur].style.zIndex = top + 1;
					images[nextImage].style.zIndex = top;
	
					await transition();
	
					images[cur].style.zIndex = top;
	
					images[nextImage].style.zIndex = top + 1;
	
					top = top + 1;
	
					images[cur].style.opacity = 1;
				
					cur = nextImage;
	
				}
	
				function transition() {
					return new Promise(function(resolve, reject) {
						var del = 0.01;
	
						id = setInterval(changeOpacity, 120);
	
						function changeOpacity() {
							images[cur].style.opacity -= del;
							if (images[cur].style.opacity <= 0) {
								clearInterval(id);
								resolve();
							}
						}
	
					})
				}
			}

			// Function to end trial after the trial duration
			function timeout_trial() {
				activeTrial = false;
				reactionTime = trial.trial_duration;
				timeout = true;
				end_trial();
			}
		}
	}
  ChangeBlindnessPlugin.info = info;

  return ChangeBlindnessPlugin;

})(jsPsychModule);