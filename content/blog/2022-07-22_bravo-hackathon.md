+++
title = "US Air Force BRAVO 01 Hackathon"
date = 2022-07-23
description = "A wrap-up of the weeklong experience that was the USAF BRAVO 01 Hackathon"
+++
What a week.

Backstory: A few weeks ago I saw reference to the USAF BRAVO 01 Hackathon, the second iteration in the BRAVO series. I think it was an email from the AFWERX email distro. I figured, why not apply? I doubted I'd get in but it can't hurt to try. I invited a friend I'd collaborated with previously to join me (more on that later), and we applied as a team.

A week or two later, we were notified that we'd been accepted! Now what? 

Information trickled out over the following days and at least I knew the schedule. I was still very unclear what I'd actually signed up for. The event would start at 0900 Monday the 18th. To practice some JavaScript, I re-wrote this website from the ground up on Sunday the 17th. 

I was still nervous about my ability to provide anything meaningful at the event. This was the USAF BRAVO Hackathon! I'd heard a lot about the first iteration held in Nellis AFB and it sounded like a serious affair.

# Day 1: Monday

I arrived at 0900 to a notification from my friend that work commitments held him up and he would be late. _Alright_, I'll be going into this one alone. I walk in and there's already a large group of folks sitting at the tables around the room. I pick a table near the back and get some coffee. 

The event kicks off with some administrative briefs: schedules, security procedures, etc... Just after noon we're allowed into the classified development room for the first time. We had access to some interesting data files, however much of them were binary structured data, and we did not have the necessary documentation or parsing software to unpack these files! I can understand not having nice documentation that explains in detail how to interpret each field from a file, but these are binary packed files, that

Once everyone had a chance to log in, the event began properly. The next several hours was a back and forth of looking at what data was available and readable, mixed in with trying to set up a proper development environment. There was a [JCN](https://www.ai.mil/jcf.html) and [Stitches](https://stitches.mil) server available locally. Both services provided GitLab and Jupyter (among some other tools). Neither server was working at first, so we dug through the share drive to find application installers for the local machine. 

I think most people were configuring an environment as a way of putting of digging into the data and figuring out what they were going to do. There was a fair bit of groaning and griping, about data documentation, quality, availability, readability, and so on. 

The first day ended with a more-or-less functional development environment on JCN once it finally came up. I had a git repository and a functioning python environment.

# Day 2 Onward

The second day started early, and uncertain. I still had no idea what I wanted to do. I was in the same boat as I think many where "I wanted to do something with the ___ data", but what that something was, or what problem it solved? I couldn't say.

This brings me to probably my #1 criticism of this event. It is possible that I missed the point, but, I understood this to be an event where we made things in a very short amount of time. I figure if we're making things, they should be solving a problem. So, what are the problems that need solving? The use cases provided were vague, and there were no representatives from those user groups that we could speak to or interact with to understand their problems and help make solutions.

I came up short with the available data, and none of the ideas I was hearing sounded interesting. Some sounded like lesser versions of tools that I suspected already existed. (The projects folks built did develop into more interesting applications by the final day!). 

I overheard two guys talking by a whiteboard and their idea sounded interesting, so, I figured, I don't have anything going right now, let's just go listen in. After a few questions, and some more drawing, we had a team of three and divided up some tasks to go do. This is how I teamed up with M. It was his idea that we were pursuing. I did think the idea was interesting, I wasn't sure how much help I would be, but why not try something new. 

We spent a few hours looking into ways we could accomplish what he was trying to do, but it started to look like it might require some specialized hardware to actually realize, and the best we could do would be to "fake it" and show what it would be like _if_ the conceptualized system was running. _That_ didn't sound that interesting anymore. I wanted to _make things_!. 

I had an idea that had been forming throughout the day, and it fell back on my familiar JavaScript/HTML tool format. While it wouldn't be something new for me, it would be creating something, and that sounded better. While slowly making some progress on my small portion of M's project, I started writing out the skeleton of my web app. 

Wednesday morning, and the start of day 3. I was increasingly souring on M's project. Not because it was a bad idea (it really is a good idea), but because we lacked the ability to develop it with the available resources and time limit. So at lunch I showed M what I'd been doing. He didn't have the vision of it yet (I'd been the one thinking about it, and didn't yet have much to show) but he was game to pivot. Our third team member was helping support the Stitches service and he ended up fairly occupied with those tasks, so our team became two. 

The Wednesday afternoon, we both had a good idea of what the path forward was. I was working on implementation in the classified computer lab, while M was looking how to implement certain tasks or find libraries that did so. I felt foolish for having spent a whole day on a development environment, now all I needed was a text editor and a web browser. This turned out to be a good thing because the Stitches and JCN servers would periodically have trouble and go down throughout the remainder of the Hackathon. Our team was never interrupted by these outages. 

The core of the application had come together by Wednesday night, but the interface didn't yet exist. That would come together, bit by bit, throughout Thursday morning. M had some experience with the Air Force so we used his experience there to make sure the wording used would make sense to an Air Force audience. _Apparently, I kept using Navy jargon, go figure._ Once the initial interface was working, we iterated on it 3-4 times, chipping away at small improvements throughout Thursday afternoon and Friday morning. 

Beyond the scope of the Hackathon, I was now genuinely excited about the tool we'd made. I thought it had real application and had produced some fairly compelling results. I didn't have the exact right parameters in it (I was going off memory from a classified report I briefly saw once), but they were close enough that I felt this was really cool.

# Data and Software

A few people asked me what data we were using, or suggested ways that maybe the existing data could be plugged into the tool we'd built. These questions seemed to come from a perspective that "well, it would be better if you used _data_". This brings me to my strongest conclusion from the event: 

> ML and data-driven solutions are great and have their place, but many problems that we have in the DoD simply need a proper application of math.

The tool we built didn't need "data" to become useful. That is because the tool exists only because of its ability to solve a problem, and it was already capable of doing that.

The other observation from these interactions is that we need to be problem-centric more than data-centric.

> Don't think "how can I use this data?". Think instead "what data do I need to solve my problem?"

It can be fun to run analyses, but the only reason we're doing it is to solve a problem. Data has a value proportional to its ability to help us solve problems or answer questions.

# Wrap up

I would definitely attend an event like this again. We were warned at the beginning that the first day or so would be awkward. It was. It still felt wrong, but teams got to a good place by the end of the week. Maybe that's just how these things work. I think Stuart Wagner and the USAF team supporting BRAVO Hackathon will take some of the lessons observed here and the next iteration will be even more successful.

The real highlight was that I met a lot of really great people from other parts of the DoD, many of which I will keep in contact with going forward.