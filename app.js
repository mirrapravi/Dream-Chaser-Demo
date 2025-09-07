class CareerCraftedApp {
    constructor() {
        this.currentJobs = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.assessmentData = {};
        this.currentStep = 1;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const assessmentForm = document.getElementById('careerAssessmentForm');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const exportBtn = document.getElementById('exportBtn');
        const refineBtn = document.getElementById('refineBtn');
        const sortBy = document.getElementById('sortBy');
        const filterSource = document.getElementById('filterSource');

        assessmentForm.addEventListener('submit', (e) => this.handleAssessment(e));
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => this.loadMoreJobs());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportResults());
        if (refineBtn) refineBtn.addEventListener('click', () => this.showRefinementOptions());
        if (sortBy) sortBy.addEventListener('change', () => this.sortJobs());
        if (filterSource) filterSource.addEventListener('change', () => this.filterJobs());
    }

    async handleAssessment(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        // Collect all assessment data
        const formData = new FormData(e.target);
        this.assessmentData = {
            personality: formData.get('personality'),
            workStyle: formData.get('workStyle'),
            superpowers: formData.get('superpowers'),
            skills: formData.get('skills'),
            dreamCareer: formData.get('dreamCareer'),
            industry: formData.get('industry'),
            location: formData.get('location'),
            relocate: formData.get('relocate'),
            jobTypes: formData.getAll('jobTypes')
        };

        // Show loading section
        this.showLoadingSection();
        this.hideAssessmentSection();
        
        // Start career analysis
        this.animateCareerAnalysis();
        
        try {
            const response = await fetch('/api/jobs/career-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.assessmentData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showCareerInsights(data.insights);
                this.displayCareerMatches(data.jobs, data.recommendations);
            } else {
                this.showError(data.error || 'Career analysis failed');
            }
        } catch (error) {
            console.error('Assessment error:', error);
            // For demo purposes, show mock results
            this.showMockCareerResults();
        } finally {
            this.isLoading = false;
            this.hideLoadingSection();
        }
    }

    showMockCareerResults() {
        // Generate personalized insights based on user input
        const insights = this.generatePersonalizedInsights();
        this.showCareerInsights(insights);
        
        // Generate matching jobs based on assessment
        const matchingJobs = this.generateMatchingJobs();
        this.displayCareerMatches(matchingJobs, insights.recommendations);
    }

    generatePersonalizedInsights() {
        const { personality, superpowers, dreamCareer, workStyle } = this.assessmentData;
        
        // Extract key career indicators
        const careerKeywords = this.extractCareerKeywords(superpowers, dreamCareer);
        const personalityTraits = this.analyzePersonality(personality);
        
        return {
            careerMatch: careerKeywords.primaryCareer,
            matchReason: this.generateMatchReason(careerKeywords, personalityTraits),
            recommendations: this.generateRecommendations(careerKeywords),
            personalityInsight: this.generatePersonalityInsight(personalityTraits, workStyle)
        };
    }

    extractCareerKeywords(superpowers, dreamCareer) {
        const text = `${superpowers} ${dreamCareer}`.toLowerCase();
        
        const careerMappings = {
            'data scientist': ['data', 'models', 'analytics', 'python', 'machine learning', 'statistics'],
            'software engineer': ['code', 'programming', 'development', 'software', 'apps', 'websites'],
            'product manager': ['product', 'strategy', 'roadmap', 'features', 'user experience'],
            'marketing manager': ['marketing', 'campaigns', 'brand', 'social media', 'advertising'],
            'designer': ['design', 'creative', 'visual', 'ui', 'ux', 'graphics'],
            'business analyst': ['analysis', 'business', 'requirements', 'process', 'optimization'],
            'project manager': ['project', 'management', 'coordination', 'planning', 'teams']
        };
        
        let bestMatch = 'software engineer';
        let maxScore = 0;
        
        for (const [career, keywords] of Object.entries(careerMappings)) {
            const score = keywords.reduce((acc, keyword) => {
                return acc + (text.includes(keyword) ? 1 : 0);
            }, 0);
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = career;
            }
        }
        
        return {
            primaryCareer: bestMatch,
            score: maxScore,
            keywords: careerMappings[bestMatch]
        };
    }

    analyzePersonality(personality) {
        const text = personality.toLowerCase();
        const traits = [];
        
        if (text.includes('creative') || text.includes('innovative')) traits.push('creative');
        if (text.includes('analytical') || text.includes('logical')) traits.push('analytical');
        if (text.includes('people') || text.includes('social')) traits.push('social');
        if (text.includes('detail') || text.includes('precise')) traits.push('detail-oriented');
        if (text.includes('leader') || text.includes('management')) traits.push('leadership');
        
        return traits;
    }

    generateMatchReason(careerKeywords, personalityTraits) {
        const career = careerKeywords.primaryCareer;
        const trait = personalityTraits[0] || 'analytical';
        
        return `You seem to be a perfect fit for ${career} roles! Your ${trait} nature and skills in ${careerKeywords.keywords.slice(0, 2).join(' and ')} align perfectly with what top companies are looking for.`;
    }

    generateRecommendations(careerKeywords) {
        const career = careerKeywords.primaryCareer;
        const companies = this.getTopCompaniesForCareer(career);
        
        return companies.map(company => ({
            company,
            role: career,
            reason: `${company} is actively hiring ${career}s and values the skills you mentioned.`
        }));
    }

    getTopCompaniesForCareer(career) {
        const companyMappings = {
            'data scientist': ['Google', 'Netflix', 'Airbnb', 'Uber', 'Meta'],
            'software engineer': ['Microsoft', 'Apple', 'Amazon', 'Google', 'Meta'],
            'product manager': ['Google', 'Apple', 'Spotify', 'Slack', 'Airbnb'],
            'marketing manager': ['Nike', 'Coca-Cola', 'Netflix', 'Adobe', 'HubSpot'],
            'designer': ['Apple', 'Adobe', 'Figma', 'Airbnb', 'Spotify'],
            'business analyst': ['McKinsey', 'Deloitte', 'Microsoft', 'Amazon', 'IBM'],
            'project manager': ['Microsoft', 'Amazon', 'Atlassian', 'Salesforce', 'Oracle']
        };
        
        return companyMappings[career] || ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'];
    }

    generatePersonalityInsight(traits, workStyle) {
        const traitDescriptions = {
            creative: 'Your creative mindset makes you excellent at innovative problem-solving',
            analytical: 'Your analytical approach helps you break down complex problems systematically',
            social: 'Your people skills make you great at collaboration and communication',
            'detail-oriented': 'Your attention to detail ensures high-quality deliverables',
            leadership: 'Your leadership qualities make you ideal for management roles'
        };
        
        const workStyleDescriptions = {
            team: 'You thrive in collaborative environments',
            independent: 'You excel when given autonomy to work independently',
            mixed: 'You adapt well to both team and individual work',
            leadership: 'You naturally gravitate toward leadership positions'
        };
        
        const primaryTrait = traits[0] || 'analytical';
        return `${traitDescriptions[primaryTrait]}. ${workStyleDescriptions[workStyle] || 'You have a flexible work approach'}.`;
    }

    showLoadingSection() {
        document.getElementById('loadingSection').style.display = 'block';
    }

    hideLoadingSection() {
        document.getElementById('loadingSection').style.display = 'none';
    }

    showResultsSection() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    hideResultsSection() {
        document.getElementById('resultsSection').style.display = 'none';
    }

    hideAssessmentSection() {
        document.getElementById('assessmentSection').style.display = 'none';
    }

    animateCareerAnalysis() {
        const progressBars = [
            'jobBoardsProgress',
            'socialMediaProgress',
            'companySitesProgress'
        ];
        
        // Update loading text for career analysis
        const loadingSection = document.getElementById('loadingSection');
        const loadingText = loadingSection.querySelector('h3');
        if (loadingText) {
            loadingText.textContent = 'Analyzing your career profile and finding perfect matches...';
        }
        
        progressBars.forEach((barId, index) => {
            setTimeout(() => {
                const bar = document.getElementById(barId);
                if (bar) bar.style.width = '100%';
            }, (index + 1) * 1000);
        });
    }

    showCareerInsights(insights) {
        const insightsSection = document.getElementById('insightsSection');
        const personalityInsight = document.getElementById('personalityInsight');
        
        personalityInsight.innerHTML = `
            <div class="insight-content">
                <h3><i class="fas fa-user-circle"></i> Your Career Profile</h3>
                <p class="personality-text">${insights.personalityInsight}</p>
                <div class="match-highlight">
                    <h4><i class="fas fa-bullseye"></i> Perfect Career Match</h4>
                    <p class="match-reason">${insights.matchReason}</p>
                </div>
            </div>
        `;
        
        insightsSection.style.display = 'block';
    }

    displayCareerMatches(jobs, recommendations) {
        this.showResultsSection();
        
        // Update results header with personalized message
        const recommendationIntro = document.getElementById('recommendationIntro');
        recommendationIntro.innerHTML = `
            <div class="personalized-intro">
                <h3><i class="fas fa-star"></i> Based on your assessment, here are your top career matches:</h3>
                <div class="recommendations-grid">
                    ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <div class="company-logo">${rec.company.charAt(0)}</div>
                            <div class="recommendation-content">
                                <h4>${rec.role} at ${rec.company}</h4>
                                <p>${rec.reason}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Update results count
        document.getElementById('resultsCount').textContent = 
            `Found ${jobs.length} perfect matches for you`;
        
        // Clear and populate jobs container
        const container = document.getElementById('jobsContainer');
        container.innerHTML = '';
        
        jobs.forEach((job, index) => {
            const jobCard = this.createJobCard(job);
            jobCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(jobCard);
        });
        
        // Show follow-up questions after a delay
        setTimeout(() => {
            document.getElementById('followUpQuestions').style.display = 'block';
        }, 2000);
    }

    generateMatchingJobs() {
        const { dreamCareer, location, relocate, jobTypes } = this.assessmentData;
        const insights = this.generatePersonalizedInsights();
        const career = insights.careerMatch;
        const companies = this.getTopCompaniesForCareer(career);
        
        const jobs = [];
        
        companies.forEach((company, index) => {
            const jobType = jobTypes.length > 0 ? jobTypes[0] : 'full-time';
            const salary = this.getSalaryForCareer(career);
            const matchScore = 95 - (index * 5); // Decreasing match scores
            
            jobs.push({
                id: `match_${company.toLowerCase()}_${index}`,
                title: `${career} - ${company}`,
                company: company,
                location: location || 'Multiple Locations',
                description: `Join ${company} as a ${career}. ${this.getJobDescription(career, company)}`,
                url: `https://${company.toLowerCase()}.com/careers`,
                salary: salary,
                matchScore: matchScore,
                source: 'CareerCrafted Match',
                postedDate: new Date(),
                remote: relocate === 'remote',
                type: jobType
            });
        });
        
        return jobs;
    }

    getSalaryForCareer(career) {
        const salaryRanges = {
            'data scientist': 120000,
            'software engineer': 110000,
            'product manager': 130000,
            'marketing manager': 85000,
            'designer': 90000,
            'business analyst': 75000,
            'project manager': 95000
        };
        
        return salaryRanges[career] || 80000;
    }

    getJobDescription(career, company) {
        const descriptions = {
            'data scientist': `Work with cutting-edge machine learning technologies and analyze complex datasets to drive business decisions.`,
            'software engineer': `Build scalable applications and work with modern tech stacks in a collaborative environment.`,
            'product manager': `Lead product strategy and work cross-functionally to deliver innovative solutions.`,
            'marketing manager': `Drive brand awareness and lead marketing campaigns across multiple channels.`,
            'designer': `Create beautiful, user-centered designs that enhance the user experience.`,
            'business analyst': `Analyze business processes and provide insights to improve operational efficiency.`,
            'project manager': `Lead cross-functional teams and ensure successful project delivery.`
        };
        
        return descriptions[career] || 'Exciting opportunity to grow your career in a dynamic environment.';
    }

    displayResults(jobs, totalCount) {
        this.showResultsSection();
        
        // Update results count
        document.getElementById('resultsCount').textContent = 
            `Found ${totalCount.toLocaleString()} jobs`;
        
        // Clear and populate jobs container
        const container = document.getElementById('jobsContainer');
        container.innerHTML = '';
        
        jobs.forEach((job, index) => {
            const jobCard = this.createJobCard(job);
            jobCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(jobCard);
        });
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.style.display = jobs.length >= 20 ? 'block' : 'none';
    }

    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card';
        
        const salaryDisplay = job.salary ? 
            `<div class="job-salary">$${job.salary.toLocaleString()}/year</div>` : 
            '<div class="job-salary">Salary not specified</div>';
        
        const postedDate = job.postedDate ? 
            new Date(job.postedDate).toLocaleDateString() : 
            'Recently posted';
        
        const matchScore = job.matchScore ? 
            `<div class="match-score">
                <i class="fas fa-star"></i>
                <span>${job.matchScore}% Match</span>
            </div>` : '';
        
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
                    <div class="job-company">${this.escapeHtml(job.company)}</div>
                </div>
                <div class="job-badges">
                    ${matchScore}
                    <div class="job-source">${this.escapeHtml(job.source)}</div>
                </div>
            </div>
            
            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(job.location || 'Location not specified')}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-briefcase"></i>
                    <span>${this.escapeHtml(job.type || 'Full-time')}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${postedDate}</span>
                </div>
                ${job.remote ? '<div class="job-detail"><i class="fas fa-home"></i><span>Remote</span></div>' : ''}
            </div>
            
            <div class="job-description">
                ${this.escapeHtml(job.description || 'No description available').substring(0, 200)}...
            </div>
            
            <div class="job-footer">
                ${salaryDisplay}
                <div class="job-actions">
                    <a href="${job.url}" target="_blank" class="btn-apply">
                        <i class="fas fa-external-link-alt"></i>
                        Apply Now
                    </a>
                    <button class="btn-save" onclick="app.saveJob('${job.id}')">
                        <i class="fas fa-bookmark"></i>
                        Save
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    async loadMoreJobs() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        try {
            const response = await fetch('/api/jobs/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...this.searchParams,
                    page: this.currentPage
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.jobs.length > 0) {
                this.currentJobs.push(...data.jobs);
                
                const container = document.getElementById('jobsContainer');
                data.jobs.forEach((job, index) => {
                    const jobCard = this.createJobCard(job);
                    jobCard.style.animationDelay = `${index * 0.1}s`;
                    container.appendChild(jobCard);
                });
                
                // Hide load more if no more results
                if (data.jobs.length < 20) {
                    loadMoreBtn.style.display = 'none';
                }
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Load more error:', error);
            this.showError('Failed to load more jobs');
        } finally {
            this.isLoading = false;
            loadMoreBtn.innerHTML = 'Load More Jobs';
        }
    }

    sortJobs() {
        const sortBy = document.getElementById('sortBy').value;
        
        let sortedJobs = [...this.currentJobs];
        
        switch (sortBy) {
            case 'date':
                sortedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                break;
            case 'salary':
                sortedJobs.sort((a, b) => (b.salary || 0) - (a.salary || 0));
                break;
            case 'company':
                sortedJobs.sort((a, b) => a.company.localeCompare(b.company));
                break;
            default: // relevance
                // Keep original order (already sorted by relevance from backend)
                break;
        }
        
        this.displayJobsOnly(sortedJobs);
    }

    filterJobs() {
        const filterSource = document.getElementById('filterSource').value;
        
        let filteredJobs = this.currentJobs;
        
        if (filterSource) {
            filteredJobs = this.currentJobs.filter(job => 
                job.source.toLowerCase().includes(filterSource.toLowerCase())
            );
        }
        
        this.displayJobsOnly(filteredJobs);
    }

    displayJobsOnly(jobs) {
        const container = document.getElementById('jobsContainer');
        container.innerHTML = '';
        
        jobs.forEach((job, index) => {
            const jobCard = this.createJobCard(job);
            jobCard.style.animationDelay = `${index * 0.05}s`;
            container.appendChild(jobCard);
        });
        
        // Update count
        document.getElementById('resultsCount').textContent = 
            `Showing ${jobs.length} jobs`;
    }

    async saveJob(jobId) {
        try {
            const response = await fetch('/api/jobs/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Job saved successfully!', 'success');
            } else {
                this.showNotification('Failed to save job', 'error');
            }
        } catch (error) {
            console.error('Save job error:', error);
            this.showNotification('Failed to save job', 'error');
        }
    }

    async exportResults() {
        try {
            const response = await fetch('/api/jobs/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobs: this.currentJobs })
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `job-search-results-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Results exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export results', 'error');
        }
    }

    async saveSearch() {
        try {
            const response = await fetch('/api/jobs/save-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.searchParams)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Search saved successfully!', 'success');
            } else {
                this.showNotification('Failed to save search', 'error');
            }
        } catch (error) {
            console.error('Save search error:', error);
            this.showNotification('Failed to save search', 'error');
        }
    }

    showError(message) {
        this.hideLoadingSection();
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#667eea'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to DOM and animate in
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Step navigation functions
function nextStep(stepNumber) {
    const currentStep = document.querySelector('.step.active');
    const nextStep = document.getElementById(`step${stepNumber}`);
    
    if (currentStep) currentStep.classList.remove('active');
    if (nextStep) nextStep.classList.add('active');
}

function prevStep(stepNumber) {
    const currentStep = document.querySelector('.step.active');
    const prevStep = document.getElementById(`step${stepNumber}`);
    
    if (currentStep) currentStep.classList.remove('active');
    if (prevStep) prevStep.classList.add('active');
}

function askFollowUp(type) {
    const questions = {
        salary: "What salary range are you targeting?",
        location: "Are you open to considering other locations?", 
        experience: "Would you consider entry-level positions to get started?",
        industry: "What other industries interest you?"
    };
    
    const answer = prompt(questions[type]);
    if (answer) {
        app.refineSearch(type, answer);
    }
}

// Initialize the app
const app = new CareerCraftedApp();
