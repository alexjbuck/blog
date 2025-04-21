+++
title = "tactical platform data interface"
date = 2025-04-16
description = "Thoughts on building good human interfaces for data collection from tactical systems"
draft = false

[taxonomies]
tags = ["defense","data"]
+++

> This post comes from my latest drill period with the Navy Reserve and is my
> reminder that data collection for airgapped systems is hard.

I started describing myself as a "data engineer" about a year ago. However, when
you do a survey of the "data engineer" landscape you find a lot of content and
jobs SQL and ETL (extract, transform, load) from a production database into an
analytics database.

When I look at what I spend a lot of my time in my civilian career doing
compared to that it makes me wonder, "am I actually a data engineer?"

I spend a significant amount of my time writing data parsing logic for telemetry
data, sometimes streaming, sometimes batch processing some data that was
recorded in the past. This rarely involves SQL as the input data is just a byte
stream and my job is turning it _into_ structured data.

## tactical platform data

I bring this up because I spent some time during my last drill period thinking
about and talking about how to exfiltrate payload data from the MH-60R tactical
maritime helicopter.

What do I mean by "tactical platform"?

I mean an intermittently operated system that does not have a continuous data
connection to a persistent database or other data storage system. The data
pathway off of the platform is via physical storage media (e.g. a hard drive)
that was used during operation to record data and can be removed and connected
to persistent infrastructure.

If your system can always expect to stream all of its data off in "real time"
then, for purposes of this discussion, it is not a tactical platform.

### a few examples

An aircraft is an example of a tactical platform. It turns on, records payload
data to onboard removable media, then shuts down after it lands.

The duration of operation doesn't really change the definition. An unmanned
underwater vehicle that operates for 2 weeks while recording to onboard media is
also a tactical platform. 

An analogy in the commercial space may be something like an Oura ring. The data
is stored locally onboard and is not continuously connected to persistent
storage.

## required action

All of these are characterized by ***requiring*** some action by the human using
the system in order to get the recorded data off of the tactical platform and
into the persistent storage.

There is no automated process to extract the data, and without modification to
the hardware of the system there cannot be. This makes handling the data from a
tactical platform fundamentally different from  something like a production
database or a website click-event stream.

## two-fold problem

The data extraction problem is really a two-fold problem:

1. First it is a psychological challenge where you need to incentivize the
   operator to take the ***required action***.
2. Second it is the usual technical challenge of parsing, structuring, and
   loading the data, aka ETL.

If you ignore the first problem, you will waste your time solving the second one
because nobody will take the ***required action*** and no data will even get to
the ETL step.

### the human problem

It would be so easy to collect data from a tactical platform if it wasn't for
the pesky humans that have to be involved. It would be so easy to collect data
from a tactical platform if it wasn't for the pesky humans that have to be
involved.

The core of this first problem is:

> tactical platforms were designed to provide value <u>during</u> Their
operation, and the benefit of post-operation data collection may not benefit
the operator directly.

This means once the operation is over, the humans start doing other things when
you, the person who wants the data that was collected, want them to be doing
your ***required action***. 

Whatever additional workflow you may require is additional friction to the self
beneficial tasks that a tactical platform operator could be doing. This means 
you need to craft your data interface to be as frictionless as possible. The 
less beneficial the data exfiltration is to the operator, the more frictionless 
the process needs to be.

## my experience with the MH-60R helicopter

So far this has been pretty abstract. I want to give a more concrete example 
based in my experience.

The MH-60R helicopter is a tactical platform that operates in the maritime 
environment. That is a fancy way of saying it takes off and lands from ships at 
sea.

It has a host of sensors onboard, designed to provide real-time "maritime domain 
awareness" to the larger force. These sensors include a surface search radar, an 
electro-optical camera in both the infrared and visible spectrum, a passive 
radar intercept/detection system, and both passive and active acoustic sensors 
that it can put into the ocean.

The aircrew get real-time information and through a combination of 
computer-based data fusion as well as plain old human brainpower synthesizing 
the output from these sensors they can paint a current picture of the  
environment.

That "current picture of the environment" is why the platform exists. Recently 
some of us data-minded aircrew have realized there are interesting questions we 
could ask  if we had access to historical "pictures of the environment" 
generated by the aircraft sensors.

### the friction

At first this seems trivial. The data _is_ recorded after all. Just tell people 
to start saving it! Put it in a policy document, "thou shalt record (correctly)!"

> This is attitude fails to address the psycological problem and is bound to 
fail.

There are several challenges facing aircrew who are being asked to save the 
data.

1. They don't want to wait 30+ minutes for data to copy off of removable media 
   after their 3+ hour flight, they want to go eat or sleep or do other 
paperwork.
2. They don't know how the recorded data is organized on the removable media 
   because there hasn't been a reason to know this.
3. They don't know where to put the data or how to organize it when moving it 
   off of the removable media.
4. Their boss doesn't prioritize recording data so they don't feel they'll get 
   in trouble for not doing it.

### the mighty checklist

The usual way that the Navy handles these types of challenges is to write a 
`checklist`.

The mighty `checklist` can answer all your questions, right?

Right?

Well, a checklist can definitely try to solve problems #2 and #3, but it doesn't 
work very well in practice and it doesn't address #1 or #4 at all.

### electronic-warfare data extract: a case study

Perhaps the best example of data recording in the MH-60R community is the 
exporting of passive radar intercept data, which is part of a domain called 
"electronic warfare".

This collection program has addressed all of these issues to some degree:

1. There has been a concerted effort and sales pitch during training to 
   emphasize the benefit to crews from exporting their data. This is made real 
through a mechanism of providing new decision aids to the crews based on the 
data they exported on a very short timeline. There is a real benefit to the 
operator. The first wrinkle is the process isn't necessarily fast still and 
requires periodic input so it also isn't something that can run in the 
background once started.
2. There is a checklist that defines where the desired files are recorded, there 
   is a training class that operators go through to practice finding the files 
and processing them. 
3. There is also a checklist that defines where the processed files should go. 
   This is where we find the next wrinkle in this program. The checklist asks 
crews to _manually_ rename a file according to a string template, something like 
`<Squadron>-<Aircraft>-<Date>.ext` (illustrative). This seems easy enough, but 
with no mechanism to _enforce_ this rule, its bound to be broken. Sure enough, 
when you look at the list of extracted files there is a large variation in the 
naming scheme. Some comply with the checklist, some are _close_ but not quite 
right, and some are just doing their own thing. You could not reliably write 
something that parses the file name in order to extract this metadata.
4. The electronic warfare mission has garnered enough attention at the "boss" 
   level that there generally is attention or pressure from superiors to 
actually complete the data extraction process but this does vary by squadron.

### acoustic data: a case study

There is a less successful data recording effort for capturing acoustic data on 
interesting contacts.

This process is less mature and is missing many of the positive aspects of the 
electronic-warfare collection program. 

1. It does not provide a clear feedback mechanism to aircrew for benefiting 
   them. Furthermore the data processing steps take considerably longer (1+ 
hours) and requires continuous input and interaction.
2. There is not a checklist that describes the data extraction steps. There is a 
   classroom training session to teach this process.
3. There is not a checklist that a structure for how the processed data should 
   be stored once extracted. There is a classroom training session to teach this 
process.
4. There is not pressure to complete these steps from superiors.

There's a new issue that this case study reveals as well:

> despite pulling from the same source data, this second "data pathway" requires 
a completely separate set of tools and procedures for extracting data.

Both the acoustic and electronic-warfare data recording processes ask for a
aircraft side number, takeoff/land times, and a "narrative" or description of
the flight event. It feels bad to have to duplicative data entry like this,
especially when some of this information is _in_ the data itself!

## a platform-aligned approach

Both of these data recording efforts are domain-aligned. Once is for 
electronic-warfare and the other is for undersea-warfare. For an analyst within 
those respective domains, dividing things this way makes a lot of sense.

This however, _creates_ `friction` for the aircrew responsible for recording 
this data rather than reducing it. This way of dividing data extraction fails to 
under the first of our two-fold problems.

Our ideal data extraction tooling would be something that adds minimal time to
post-flight duties, automates as many tasks as possible, and makes any human
input so intuitive that you don't even need a checklist. The final challenge,
regarding pressure to complete the process can be assisted by providing a clear
dashboard or visibility layer to whether or not the data from a flight was
actually recorded.

This baseline tooling should be extensible such that domain-aligned processing
can "hook" into it and access the relevant information while the _user
interface_ is platform aligned for the benefit of the platform operator.

## Cronus

Cronus is a tool I wrote for MH-60R operators to streamline the required
aircrew actions for collecting post-mission recorded data into as few as 3
mouse clicks and 3 key presses, 4 mouse clicks if you count running the
program, well fine, 5 if you use a double click to open it. Either way, its an
interface that speaks the same language as aircrew not the engineers and has
very few required interactions.

> I'll never forget when I asked an aircrewman to open up the windows file
explorer so we could copy data off the data transfer devices (DTDs), and he
responded with "what's that?"

The tool does this by understanding the workflow, making judicious assumptions,
and automating anything that's remotely possible to automate (while providing a
manual backup for edge cases if automation fails).

To illustrate this, it asks for the Squadron, AOR (area of responsibility, i.e.
geographic region), aircraft serial number, landing time time, and Windows
drive letters for the USB data devices once they're mounted. Squadron is
somethign that almost never changes so the app remembers what the value was
entered during the last usage, meaning realistically this gets set once and
doesn't need to be interacted with for months. The AOR changes, but slowly.
Just as with the squadron the app remembers the last input value but exposes a
simple editable text entry where a new value can be entered and remembered when
changing between AORs. The aircraft serial number must be put in manually. It
is a sad reality that while the recorded data includes a value for aircraft
serial number but it is not trustworthy as it is simply a reflection of what
was selected when the aircraft mission data was prepared, and by knowing the
habitual workflow of fleet operators, that is often not accurately set as there
is essentially no negative impact to it not being set correctly, other than the
data being mis-labeled. Entering this value is the source of the 3 key strokes.
The landing time is pre-populated by the current time when the application is
opened. The landing time here is only used to generate a "close enough" time
stamp so a unique folder name can be constructed that also has some real-world
meaning. A _better_ option would be to parse the recorded data and pull out the
launch time, and this is something I would like to implement soon. Either way,
the automatic value is sufficient. Finally the windows drive letters. The
application assumes that the most likely use case for archiving the data is
right after a flight when you have the recorded data on the data transfer
devices (DTDs). Because this is the known workflow, we can make this assumption
and scan all available Windows drives and heuristically evaluate if they are a
DTD. If they are, then the app will automatically select them for archiving. In
the off chance that the drives are not detected, or non-data drives are
detected and selected for archiving, there are buttons to clear the list, which
_automatically_ disables the automatic selection feature and lets you use the
manual selection feature. Finally there is a large obvious, colored button that
you press to begin the data transfer/archive process. 

Before you ask, yes I did provide a _checklist_ for this tool but it was a
single page kneeboard-card (KBC) size format, and feedback from users was that
it required no additional instruction to understand.

Using the Cronus tool I saw an extremely consistent result in terms of an
organized archive of flight data. We offloaded the procedural and formulaic
parts onto the computer and let the human only provide the minimum of necessary
input. This is a more enjoyable, effective, and time efficient tool
interaction.

## Now what?

Data collection and archive processes should focus on platform-aligned tooling
and be extremely aware of the existing workflows of the operators who will
ultimately be responsible for effecting the data collection. The wording used
in the collection tooling should match operators vernacular and not the
engineering vocabulary unless this leads to ambiguity. 

If you're in the MH-60R community and you want to learn more about Cronus or
how to expand upon it, reach to me through my Navy email, I am findable in the
global address list.
