+++
title = "the dawn of algorithmic warfare"
date = 2023-11-24
description = "Republishing my article submitted to and published by the Naval Helicopter Association."

[taxonomies]
tags = ["ai", "military", "defense"]
+++

> Note: This is a republishing of an article submitted to and published by the Naval Helicopter Association. The original publication can be read [here](https://issuu.com/rotorrev/docs/rr_152_summer.21/s/12233207).

## The Sunrise Bag

As you walk into the dim green light of the flight deck you catch the warm breeze so characteristic of the South China Sea. You arrived in theater one week ago and every day since you’ve been on the sunrise bag with the 0230 launch. Your tasking is to sanitize a straits transit from reported red force submarines whose farthest on circles are now approaching your position. As you launch and seed your buoys, the littoral environment makes interpreting the sonar data challenging.

With a flip of a switch, you turn on the new acoustic processing feature powered by machine learning and the displays change. Now you have markers classifying each sound you’re hearing and clustering the sources into possible contacts. The new processing mode benefits from hundreds of hours of examples recorded by aircrew like you over the past two years to compare these new sounds against. Suddenly a quiet cluster, otherwise hidden in the noise of fishing trawlers and merchant ships transiting the strait, now clearly stands out with a unique signature! With the sun just starting to light the eastern sky, you key the mic to call Zulu with your contact report… 


The future of warfighting is on the horizon. The spectrum of artificial intelligence (AI) tools, from perception tasks like the previous example, to complex reasoning and planning, are already being developed. The next step for the Navy and the HSM community is envisioning how we incorporate AI and machine learning (ML) into warfighting doctrine. There are certainly limitations to this nascent technology but "history informs us that those who are first to harness once-in-a-generation technologies often have a decisive advantage on the battlefield for years to come," said Defense Secretary Mark Esper1. 

## AI Is Already Here, It Always Has Been 

Fundamentally AI is just the process of automating a cognitive task2 and it is all around us when we operate our aircraft. The radar data processor analyzing radar returns to generate “tracks”, the acoustic processor detecting clusters and sequential detections, the electronic support measures system proposing identifications for detected signals; these are all examples of “expert systems” artificial intelligence. They have hard coded rules, created by subject matter experts, to automate the processing of sensor data. As aircrew we trust them and we take advantage of the mental space afforded by these automated tasks to be a more effective crew.  

 

The limitation with these systems is their ability to scale to complex problems. The creators need to explicitly define the decisions the machine could make, ahead of time, which is daunting for a complex task such as “detect and classify the acoustic target in this sonar data”, or “identify what type of vessel this is a picture of”. 

The field of machine learning, specifically deep learning, offers a different avenue. Instead of codifying every aspect of the decision process, the machine learns the important features from a comprehensive collection of examples that have been labeled with the correct interpretation. By providing the inputs (sensor data) and the output (the correct interpretation) the machine can learn arbitrarily complex analyses. The burden then becomes gathering enough examples to properly teach the machine. As opaque and mysterious as this new phase of AI may seem at first, this phase defined by machine learning is not fundamentally new; it is still a computer just crunching numbers. 

## The Fleet’s Call to Action 

The entire concept of machine learning relies on the premise that there is a large enough set of examples from which the machine can learn. This is simply not a true statement for the naval helicopter community. The HSM community faces many significant challenges in large scale data collection3, from storage limitations to network bandwidth constraints in the shipboard environment.

Serendipitously, in September 2020 the DoD, through its first ever “DoD Data Strategy”4, established the vision to be “a data-centric organization that uses data at speed and scale for operational advantage and increased efficiency.” Within this foundational document, the DoD establishes 8 guiding principles. The three most relevant to HSM are: 


> 1\. Data is a Strategic Asset – DoD data is a high-interest commodity and must be leveraged in a way that brings both immediate and lasting military advantage. 
>
> 4\. Data Collection – DoD must enable electronic collection of data at the point of creation and maintain the pedigree of that data at all times. 
>
> 6\. Data for Artificial Intelligence Training – Data sets for A.I. training and algorithmic models will increasingly become the DoD’s most valuable digital assets and we must create a framework for managing them across the data lifecycle that provides protected visibility and responsible brokerage. 

 

The DoD Data Strategy charts a course that values the collection and exploitation of data at all levels of the Department. Within the Office of the Undersecretary of Defense for Intelligence and Security, there is already movement to enact the framework to manage AI systems (most visibly with the Algorithmic Warfare Cross-Functional Team (AWCFT), also known as Project Maven). Project Maven demonstrated the viability of using ML to analyze full-motion video from MQ-1 and MQ-9 UAS platforms, providing object detection and cuing analysts to only look at relevant video clips rather than hours on end empty video. Acknowledging the value of data and collecting data from the tactical edge, however, remains within the hands of the operators that live there. The fleet’s hands. Our hands. 

## HSM Charts a Course 

Inspired by a white paper penned by LTJG Sherbinin5 of the USS Rafael Peralta, the Helicopter Maritime Strike Wing Pacific (CHSMWP), via the Weapons School (HSMWSP), entered a dialog with Project Maven to address these principles. The timing with the fleet release of System Configuration 18 and the proliferation of Advanced Data Transfer System (ADTS) hardware could not be better. The combination of Sys Config 18 and ADTS provides unprecedented access to recorded sensor data relevant to all of our primary warfare domains. 

 

In cooperation with Project Maven, HSMWSP has developed a collection process that leverages the Commercial Cloud Service (C2S) contract between the Intelligence Community (IC) and Amazon Web Services (AWS) to store and process data up to SECRET//NOFORN classification. This process uses the AWS Snowball Edge storage device to mitigate both storage space, and network bandwidth challenges. The Snowball Edge is a suitcase sized 80 TB (1 TB = 1000 GB) storage device designed and ruggedized for operating in the field, or in our case, on the ship. The storage space is so large that it will fit all the data generated by an entire CVW element over a 6-month deployment, effectively getting rid of any storage constraints. After deployment, the device is shipped back to the classified AWS cloud server for long term storage and exploitation by DoD machine learning engineers. It brings to mind the saying, “Never underestimate the bandwidth of a truck full of hard drives hurtling down the highway.” This device can begin to solve both the storage space and bandwidth limitations faced by the community. 

 

We took a crawl-walk-run approach to developing this capability. Over a 5-month span, from July to November 2020, HSMWSP developed the tools and procedures to store every byte of recorded data from the MH-60R onto the Snowball Edge. The result was a Memorandum of Understanding between the Office of Undersecretary of Defense for Intelligence and Security [OUSD(IS), the agency that houses Project Maven], and CHSMWP to begin data collection from operational units. 

 

With the process prototyped, we identified the first two units for our sea trial: HSM-75 onboard USS Theodore Roosevelt, and HSM-35.2 onboard USS John Finn. These two units represent the two main deployment patterns for HSM units: a large unit embarked on the CVN with the space that affords, and a small footprint onboard a CRUDES with minimal manning. These two efforts are ongoing and are intended to determine the challenges with shipboard operations that can't be found in the office. Once those challenges have been addressed it will be time to run; the roadmap is to scale up include additional CHSMWP deploying units (perhaps yours!) and scale out to include CHSMWL. 

> “I would be so bold to suggest the DoD should never buy another weapon system for the rest of its natural life without artificial intelligence baked into it.” 
>
> <cite>-- Lt Gen. Jack Shanahan, USAF. Director, DoD Joint AI Center (JAIC)</cite>


## Stepping into the Sunrise 

HSM prides itself on being an exquisite surveillance and collection platform; we have a degree of presence and persistence that is invaluable. There is a small (r)evolution regarding how humans interact with our sensors, caused by advancements in AI/ML over the past decade. Project Maven highlighted the shift with object detection within video feeds and there are new initiatives are coming online that apply acoustic analysis and discrimination to the undersea warfare domain (see Project Harbinger7). We have a bright future available but if the HSM community cannot provide the requisite large collection of real-world examples to develop these systems for our sensors, it may very well get left in the dark. 